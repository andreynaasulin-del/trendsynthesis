// ============================================
// TRENDSYNTHESIS — Projects API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, deleteProject } from "@/lib/supabase/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/projects - Get all user projects
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const projects = await getProjects();

        return NextResponse.json({
            success: true,
            data: projects,
        });
    } catch (error: any) {
        console.error("[API] Projects GET error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

// POST /api/projects - Create new project
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
        const { topic, video_count, style, language } = body;

        if (!topic) {
            return NextResponse.json(
                { success: false, error: "Topic is required" },
                { status: 400 }
            );
        }

        // Check credits
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining")
            .eq("id", user.id)
            .single();

        if (!profile || profile.credits_remaining < 1) {
            return NextResponse.json(
                { success: false, error: "No credits remaining. Please upgrade your plan." },
                { status: 403 }
            );
        }

        const project = await createProject({
            topic,
            video_count: video_count || 6,
            style: style || "cinematic",
            language: language || "en",
        });

        return NextResponse.json({
            success: true,
            data: project,
        });
    } catch (error: any) {
        console.error("[API] Projects POST error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create project" },
            { status: 500 }
        );
    }
}

// DELETE /api/projects?id=xxx - Delete project
export async function DELETE(request: NextRequest) {
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
        const projectId = searchParams.get("id");

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: "Project ID is required" },
                { status: 400 }
            );
        }

        await deleteProject(projectId);

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error: any) {
        console.error("[API] Projects DELETE error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to delete project" },
            { status: 500 }
        );
    }
}
