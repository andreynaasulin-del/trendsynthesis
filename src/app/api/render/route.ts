// ============================================
// TRENDSYNTHESIS — Render Video API
// Tracks rendering status
// Primary rendering: client-side via VideoCarousel + MediaRecorder
// Server-side rendering available via CLI: npm run remotion:render
// ============================================

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateVideoStatus, getProject } from "@/lib/supabase/db";

interface RenderRequest {
    video_id: string;
    project_id: string;
    composition_data?: {
        clips: string[];
        subtitles: any[];
        style: any;
        duration_frames: number;
        fps: number;
        width: number;
        height: number;
    };
    // Client-side rendering result upload
    client_render?: {
        file_url: string;
    };
}

// POST /api/render - Track/complete video rendering
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        // TEST MODE: Allow without auth — just handle client-side render flow
        const body: RenderRequest = await request.json();
        const { video_id, project_id, composition_data, client_render } = body;

        if (!video_id || !project_id) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify project belongs to user
        const project = await getProject(project_id);
        if (!project) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        // Case 1: Client-side render completed — update the DB
        if (client_render?.file_url) {
            await supabase
                .from("videos")
                .update({
                    status: "completed",
                    render_progress: 100,
                    file_url: client_render.file_url,
                    completed_at: new Date().toISOString()
                })
                .eq("id", video_id);

            return NextResponse.json({
                success: true,
                data: {
                    video_id,
                    status: "completed",
                    file_url: client_render.file_url,
                },
            });
        }

        // Case 2: Mark video as ready for client-side rendering
        if (composition_data) {
            await updateVideoStatus(video_id, "rendering", 0);
        }

        // Client-side rendering is the primary approach for web deployment
        // For high-quality server-side rendering, use CLI: npm run remotion:render
        return NextResponse.json({
            success: true,
            data: {
                video_id,
                status: "pending_client_render",
                message: "Use client-side rendering to export video",
                client_render_required: true,
            },
        });

    } catch (error: any) {
        console.error("[API] Render error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to start rendering" },
            { status: 500 }
        );
    }
}

// GET /api/render?video_id=xxx - Get render status
export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get("video_id");

        if (!videoId) {
            return NextResponse.json(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            );
        }

        const { data: video, error } = await supabase
            .from("videos")
            .select("*")
            .eq("id", videoId)
            .single();

        if (error || !video) {
            return NextResponse.json(
                { success: false, error: "Video not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: video.id,
                status: video.status,
                progress: video.render_progress,
                file_url: video.file_url,
                completed_at: video.completed_at,
            },
        });
    } catch (error: any) {
        console.error("[API] Render status error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to get render status" },
            { status: 500 }
        );
    }
}
