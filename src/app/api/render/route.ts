// ============================================
// TRENDSYNTHESIS — Render Video API
// Starts video rendering via Remotion Lambda or local
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateVideoStatus, getProject } from "@/lib/supabase/db";

interface RenderRequest {
    video_id: string;
    project_id: string;
    composition_data: {
        clips: string[];
        subtitles: any[];
        style: any;
        duration_frames: number;
        fps: number;
        width: number;
        height: number;
    };
}

// POST /api/render - Start video rendering
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

        const body: RenderRequest = await request.json();
        const { video_id, project_id, composition_data } = body;

        if (!video_id || !project_id || !composition_data) {
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

        // Update video status to rendering
        await updateVideoStatus(video_id, "rendering", 0);

        // TODO: In production, trigger Remotion Lambda here
        // For now, we'll simulate the rendering process
        // 
        // Example Remotion Lambda call:
        // const { renderId } = await renderMediaOnLambda({
        //   region: "us-east-1",
        //   functionName: "trendsynthesis-render",
        //   composition: "ViralMontage",
        //   inputProps: composition_data,
        //   codec: "h264",
        //   ...
        // });

        // Simulate rendering progress (in production, use webhooks)
        const simulateProgress = async () => {
            for (let progress = 10; progress <= 100; progress += 10) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await updateVideoStatus(video_id, progress === 100 ? "completed" : "rendering", progress);
            }
        };

        // Don't await - let it run in background
        simulateProgress().catch(console.error);

        return NextResponse.json({
            success: true,
            data: {
                video_id,
                status: "rendering",
                message: "Video rendering started",
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
