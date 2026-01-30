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

        console.log(`[Ingest] Starting search for: ${query}`);

        // 1. Pexels Discovery
        let videoUrl = "";
        let provider = "pexels";

        if (PEXELS_API_KEY) {
            try {
                const pexelsResponse = await fetch(
                    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=1`,
                    { headers: { Authorization: PEXELS_API_KEY } }
                );

                if (pexelsResponse.ok) {
                    const pexelsData = await pexelsResponse.json();
                    if (pexelsData.videos?.length > 0) {
                        const videoFiles = pexelsData.videos[0].video_files;
                        const bestVideo = videoFiles.find((f: any) => f.height === 1920 && f.width === 1080) || videoFiles[0];
                        videoUrl = bestVideo.link;
                        console.log(`[Ingest] Found Pexels asset: ${videoUrl}`);
                    }
                }
            } catch (e) {
                console.warn("[Ingest] Pexels failed, falling back...", e);
            }
        }

        // Fallback to Coverr
        if (!videoUrl) {
            console.log("[Ingest] Switching to Coverr fallback");
            provider = "coverr";
            videoUrl = "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-vertical-4565/1080p.mp4";
        }

        // If we have no Supabase Admin, return direct link immediately (Fall-through mode)
        if (!supabaseAdmin) {
            console.warn("[Ingest] SUPABASE_SERVICE_ROLE_KEY missing. Skipping secure storage.");
            return NextResponse.json({
                success: true,
                url: videoUrl,
                source: provider,
                note: "Storage skipped (Configuration missing)"
            });
        }

        // 2. Memory Capture & 3. Supabase Upload
        try {
            console.log(`[Ingest] Capturing stream from ${provider}...`);
            const mediaResponse = await fetch(videoUrl);
            if (!mediaResponse.ok) throw new Error("Failed to fetch media stream");

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

            const { data: publicUrlData } = supabaseAdmin.storage
                .from(RAW_VIDEOS_BUCKET)
                .getPublicUrl(fileName);

            console.log(`[Ingest] Asset deployed to: ${publicUrlData.publicUrl}`);

            return NextResponse.json({
                success: true,
                asset_id: fileId,
                url: publicUrlData.publicUrl,
                source: "trendsynthesis-secure-storage",
                meta: { processed_at: new Date().toISOString() }
            });

        } catch (storageError) {
            console.error("[Ingest] Storage Pipeline Failed (Returning direct link):", storageError);
            // Fallback: Return the original direct link if storage fails
            return NextResponse.json({
                success: true,
                url: videoUrl,
                source: provider,
                error: "Storage ingestion failed, served from source"
            });
        }

    } catch (error: any) {
        console.error("[Ingest] Critical Failure:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
