// ============================================
// TRENDSYNTHESIS — Single Project API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProjectStatus, saveScenarios, getScenarios, getVideos } from "@/lib/supabase/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get single project with scenarios and videos
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const project = await getProject(id);

        if (!project) {
            return NextResponse.json(
                { success: false, error: "Project not found" },
                { status: 404 }
            );
        }

        // Get associated data
        const scenarios = await getScenarios(id);
        const videos = await getVideos(id);

        return NextResponse.json({
            success: true,
            data: {
                ...project,
                scenarios,
                videos,
            },
        });
    } catch (error: any) {
        console.error("[API] Project GET error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch project" },
            { status: 500 }
        );
    }
}

// PATCH /api/projects/[id] - Update project status
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { status } = body;

        if (status) {
            await updateProjectStatus(id, status);
        }

        return NextResponse.json({
            success: true,
            message: "Project updated successfully",
        });
    } catch (error: any) {
        console.error("[API] Project PATCH error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update project" },
            { status: 500 }
        );
    }
}

// POST /api/projects/[id]/scenarios - Save scenarios to project
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { scenarios } = body;

        if (!scenarios || !Array.isArray(scenarios)) {
            return NextResponse.json(
                { success: false, error: "Scenarios array is required" },
                { status: 400 }
            );
        }

        const savedScenarios = await saveScenarios(id, scenarios);

        return NextResponse.json({
            success: true,
            data: savedScenarios,
        });
    } catch (error: any) {
        console.error("[API] Project POST scenarios error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to save scenarios" },
            { status: 500 }
        );
    }
}
