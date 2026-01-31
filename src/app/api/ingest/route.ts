// ============================================
// TRENDSYNTHESIS — Ingest API V2
// Multi-query support for scenario-based ingestion
// ============================================

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

const RAW_VIDEOS_BUCKET = "raw-videos";
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Extended Coverr fallback pool (diverse scenes)
const COVERR_FALLBACKS = [
  "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-vertical-4565/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-neon-signs-in-tokyo-night-4546/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-traffic-at-night-vertical-4532/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-man-working-on-laptop-at-night-4521/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-young-woman-using-phone-4498/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-aerial-view-of-city-lights-4495/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-woman-walking-in-the-rain-7786/1080p.mp4",
  "https://cdn.coverr.co/videos/coverr-coffee-shop-ambience-4478/1080p.mp4",
];

// --- Single query search ---
async function searchPexels(query: string, count: number = 4): Promise<string[]> {
  if (!PEXELS_API_KEY) return [];

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=${count}`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.videos?.length) return [];

    return data.videos.map((video: any) => {
      // Prefer 1080x1920, then any HD, then first available
      const best =
        video.video_files.find((f: any) => f.height === 1920 && f.width === 1080) ||
        video.video_files.find((f: any) => f.height >= 1080) ||
        video.video_files[0];
      return best.link;
    });
  } catch (e) {
    console.warn(`[Ingest] Pexels search failed for "${query}":`, e);
    return [];
  }
}

// --- Get random fallbacks from pool ---
function getRandomFallbacks(count: number): string[] {
  const shuffled = [...COVERR_FALLBACKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// --- Upload to Supabase ---
async function uploadToStorage(url: string): Promise<string> {
  if (!supabaseAdmin) return url;

  try {
    const res = await fetch(url);
    if (!res.ok) return url;

    const buffer = Buffer.from(await res.arrayBuffer());
    const fileName = `${uuidv4()}.mp4`;

    const { error } = await supabaseAdmin.storage
      .from(RAW_VIDEOS_BUCKET)
      .upload(fileName, buffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage
      .from(RAW_VIDEOS_BUCKET)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error(`[Ingest] Upload failed:`, err);
    return url;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // V2: Support both single query AND multi-query (from scenarios)
    const queries: string[] = body.queries || (body.query ? [body.query] : []);
    const clipsPerQuery: number = body.clips_per_query || 4;

    if (queries.length === 0) {
      return NextResponse.json({ error: "Query or queries[] required" }, { status: 400 });
    }

    console.log(`[Ingest V2] Processing ${queries.length} queries, ${clipsPerQuery} clips each`);

    // --- Search all queries in parallel ---
    const searchResults = await Promise.all(
      queries.map(async (query) => {
        let urls = await searchPexels(query, clipsPerQuery);
        let provider = "pexels";

        // Fallback per query
        if (urls.length === 0) {
          urls = getRandomFallbacks(clipsPerQuery);
          provider = "coverr";
          console.log(`[Ingest] Fallback for "${query}" → ${urls.length} Coverr clips`);
        }

        return {
          query,
          provider,
          urls,
        };
      })
    );

    // --- Optional: Upload to Supabase Storage ---
    const shouldUpload = supabaseAdmin && body.upload !== false;

    let finalResults;
    if (shouldUpload) {
      console.log(`[Ingest V2] Uploading to secure storage...`);
      finalResults = await Promise.all(
        searchResults.map(async (result) => ({
          ...result,
          urls: await Promise.all(result.urls.map(uploadToStorage)),
          provider: "trendsynthesis-storage",
        }))
      );
    } else {
      finalResults = searchResults;
    }

    // --- Build response ---
    // Flat assets list (backward compatible)
    const allAssets = finalResults.flatMap(r => r.urls);

    // Grouped by query (V2)
    const grouped = finalResults.map(r => ({
      query: r.query,
      assets: r.urls,
      provider: r.provider,
    }));

    return NextResponse.json({
      success: true,
      // V1 compat: flat list
      assets: allAssets,
      // V2: grouped by query
      grouped,
      meta: {
        queries: queries.length,
        total_clips: allAssets.length,
        clips_per_query: clipsPerQuery,
      },
    });

  } catch (error: any) {
    console.error("[Ingest V2] Critical Failure:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
