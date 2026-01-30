import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

const RAW_VIDEOS_BUCKET = "raw-videos";
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();
        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        console.log(`[Ingest] Starting montage search for: ${query}`);

        // 1. Pexels Discovery
        let videoUrls: string[] = [];
        let provider = "pexels";

        if (PEXELS_API_KEY) {
            try {
                // Fetch 4 videos for a montage
                const pexelsResponse = await fetch(
                    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=4`,
                    { headers: { Authorization: PEXELS_API_KEY } }
                );

                if (pexelsResponse.ok) {
                    const pexelsData = await pexelsResponse.json();
                    if (pexelsData.videos?.length > 0) {
                        videoUrls = pexelsData.videos.map((video: any) => {
                            const bestFile = video.video_files.find((f: any) => f.height === 1920 && f.width === 1080) || video.video_files[0];
                            return bestFile.link;
                        });
                        console.log(`[Ingest] Found ${videoUrls.length} Pexels assets.`);
                    }
                }
            } catch (e) {
                console.warn("[Ingest] Pexels failed, falling back...", e);
            }
        }

        // Fallback to Coverr (Mix of URLs to simulate variety if Pexels fails)
        if (videoUrls.length === 0) {
            console.log("[Ingest] Switching to Coverr fallback");
            provider = "coverr";
            videoUrls = [
                "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-vertical-4565/1080p.mp4",
                "https://cdn.coverr.co/videos/coverr-neon-signs-in-tokyo-night-4546/1080p.mp4",
                "https://cdn.coverr.co/videos/coverr-traffic-at-night-vertical-4532/1080p.mp4",
                "https://cdn.coverr.co/videos/coverr-man-working-on-laptop-at-night-4521/1080p.mp4"
            ];
        }

        // If no Supabase Admin, return direct links immediately (Fall-through mode)
        if (!supabaseAdmin) {
            return NextResponse.json({
                success: true,
                assets: videoUrls,
                source: provider,
                note: "Storage skipped (Configuration missing)"
            });
        }

        // 2. Parallel Memory Capture & Upload
        console.log(`[Ingest] Ingesting ${videoUrls.length} assets to secure storage...`);

        const uploadPromises = videoUrls.map(async (url) => {
            try {
                const mediaResponse = await fetch(url);
                if (!mediaResponse.ok) return url; // Fallback to source if fetch fails

                const arrayBuffer = await mediaResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const fileId = uuidv4();
                const fileName = `${fileId}.mp4`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from(RAW_VIDEOS_BUCKET)
                    .upload(fileName, buffer, {
                        contentType: "video/mp4",
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (uploadError) throw uploadError;

                const { data } = supabaseAdmin.storage
                    .from(RAW_VIDEOS_BUCKET)
                    .getPublicUrl(fileName);

                return data.publicUrl;
            } catch (err) {
                console.error(`[Ingest] Failed to upload ${url}:`, err);
                return url; // Fallback to original
            }
        });

        const secureAssets = await Promise.all(uploadPromises);

        return NextResponse.json({
            success: true,
            assets: secureAssets,
            source: "trendsynthesis-secure-storage",
            meta: { count: secureAssets.length }
        });

    } catch (error: any) {
        console.error("[Ingest] Critical Failure:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
