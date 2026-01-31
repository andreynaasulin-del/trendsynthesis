// ============================================
// TRENDSYNTHESIS — Generation Status API
// GET /api/generate/status?project_id=xxx
// Real-time generation tracking via Supabase
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProject, getScenarios, getVideos } from "@/lib/supabase/db";

// GET /api/generate/status?project_id=xxx — Get generation/render status
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
        const projectId = searchParams.get("project_id");

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: "Project ID is required" },
                { status: 400 }
            );
        }

        // Get project with ownership check
        const project = await getProject(projectId);

        if (!project) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        // Get scenarios
        const scenarios = await getScenarios(projectId);

        // Get videos
        const videos = await getVideos(projectId);

        // Calculate progress
        const totalVideos = videos.length;
        const completedVideos = videos.filter(v => v.status === "completed").length;
        const renderingVideos = videos.filter(v => v.status === "rendering").length;
        const failedVideos = videos.filter(v => v.status === "failed").length;

        // Calculate overall progress
        let overallProgress = 0;
        if (totalVideos > 0) {
            const videoProgress = videos.reduce((sum, v) => sum + (v.render_progress || 0), 0);
            overallProgress = Math.round(videoProgress / totalVideos);
        }

        // Determine overall status
        let overallStatus: string = project.status;
        if (failedVideos > 0 && failedVideos === totalVideos) {
            overallStatus = "failed";
        } else if (completedVideos === totalVideos && totalVideos > 0) {
            overallStatus = "completed";
        } else if (renderingVideos > 0) {
            overallStatus = "rendering";
        }

        // Build stage info for frontend
        const stages = [
            {
                id: "scenarios",
                name: "Scenarios",
                nameRu: "Сценарии",
                status: scenarios.length > 0 ? "completed" : "waiting",
                count: scenarios.length,
            },
            {
                id: "videos",
                name: "Videos",
                nameRu: "Видео",
                status: overallStatus,
                total: totalVideos,
                completed: completedVideos,
                rendering: renderingVideos,
                failed: failedVideos,
                progress: overallProgress,
            },
        ];

        return NextResponse.json({
            success: true,
            data: {
                project_id: projectId,
                topic: project.topic,
                status: overallStatus,
                progress: overallProgress,
                stages,
                videos: videos.map(v => ({
                    id: v.id,
                    status: v.status,
                    progress: v.render_progress,
                    file_url: v.file_url,
                    thumbnail_url: v.thumbnail_url,
                })),
                created_at: project.created_at,
                completed_at: project.completed_at,
            },
        });

    } catch (error: any) {
        console.error("[API] Generation Status Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to get status" },
            { status: 500 }
        );
    }
}

// POST /api/generate/status — Update render progress (for webhook/internal use)
export async function POST(request: NextRequest) {
    try {
        // This could be called by Remotion Lambda webhook
        const body = await request.json();
        const { video_id, status, progress, file_url, render_id, secret } = body;

        // Simple secret check for internal calls (in production, use JWT or Remotion signature)
        if (secret !== process.env.RENDER_WEBHOOK_SECRET && process.env.RENDER_WEBHOOK_SECRET) {
            return NextResponse.json(
                { success: false, error: "Invalid secret" },
                { status: 403 }
            );
        }

        if (!video_id) {
            return NextResponse.json(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        // Build update object
        const updates: Record<string, unknown> = {};
        if (status) updates.status = status;
        if (typeof progress === "number") updates.render_progress = progress;
        if (file_url) updates.file_url = file_url;
        if (render_id) updates.remotion_render_id = render_id;
        if (status === "completed") updates.completed_at = new Date().toISOString();

        const { error } = await supabase
            .from("videos")
            .update(updates)
            .eq("id", video_id);

        if (error) {
            console.error("[API] Failed to update video status:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        console.log(`[API] Updated video ${video_id}: status=${status}, progress=${progress}`);

        return NextResponse.json({
            success: true,
            data: { video_id, ...updates },
        });

    } catch (error: any) {
        console.error("[API] Status Update Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update status" },
            { status: 500 }
        );
    }
}
