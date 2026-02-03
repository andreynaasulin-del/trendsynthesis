// ============================================
// TRENDSYNTHESIS — Export Video API
// GET /api/export — Download rendered video
// ============================================

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/export?video_id=xxx — Get video download URL
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get("video_id");

        if (!videoId) {
            return NextResponse.json(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            );
        }

        // Get video with project check for ownership
        const { data: video, error: videoError } = await supabase
            .from("videos")
            .select(`
        id,
        status,
        file_url,
        thumbnail_url,
        duration_seconds,
        file_size_bytes,
        project:projects!inner(user_id)
      `)
            .eq("id", videoId)
            .single();

        if (videoError || !video) {
            return NextResponse.json(
                { success: false, error: "Video not found" },
                { status: 404 }
            );
        }

        // Check ownership
        if ((video.project as any).user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Check if video is ready
        if (video.status !== "completed") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Video is not ready for export",
                    status: video.status,
                },
                { status: 400 }
            );
        }

        if (!video.file_url) {
            return NextResponse.json(
                { success: false, error: "Video file not available" },
                { status: 404 }
            );
        }

        // Log export
        await supabase.from("usage_logs").insert({
            user_id: user.id,
            action: "video_export",
            metadata: { video_id: videoId },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: video.id,
                download_url: video.file_url,
                thumbnail_url: video.thumbnail_url,
                duration_seconds: video.duration_seconds,
                file_size_bytes: video.file_size_bytes,
            },
        });

    } catch (error: any) {
        console.error("[API] Export Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to export video" },
            { status: 500 }
        );
    }
}

// POST /api/export — Trigger video export/encoding (future use)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { video_id, format = "mp4", quality = "1080p" } = body;

        if (!video_id) {
            return NextResponse.json(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            );
        }

        // Validate format and quality
        const validFormats = ["mp4", "webm", "mov"];
        const validQualities = ["720p", "1080p", "4k"];

        if (!validFormats.includes(format)) {
            return NextResponse.json(
                { success: false, error: `Invalid format. Use: ${validFormats.join(", ")}` },
                { status: 400 }
            );
        }

        if (!validQualities.includes(quality)) {
            return NextResponse.json(
                { success: false, error: `Invalid quality. Use: ${validQualities.join(", ")}` },
                { status: 400 }
            );
        }

        // Check plan for quality limits
        const { data: profile } = await supabase
            .from("profiles")
            .select("plan")
            .eq("id", user.id)
            .single();

        if (quality === "4k" && profile?.plan !== "agency") {
            return NextResponse.json(
                { success: false, error: "4K export requires Agency plan" },
                { status: 403 }
            );
        }

        // TODO: Trigger actual export job when Lambda is set up
        // For now, return the existing file

        const { data: video } = await supabase
            .from("videos")
            .select("file_url, status")
            .eq("id", video_id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                video_id,
                format,
                quality,
                status: video?.status || "pending",
                download_url: video?.file_url || null,
                message: "Export job queued",
            },
        });

    } catch (error: any) {
        console.error("[API] Export POST Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to queue export" },
            { status: 500 }
        );
    }
}
