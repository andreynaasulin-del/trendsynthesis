// ============================================
// TRENDSYNTHESIS — Save Generation API
// Saves complete generation (project + scenarios + compositions)
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createProject, saveScenarios, updateProjectStatus, createVideo } from "@/lib/supabase/db";
import type { Scenario, MontageComposition } from "@/types";

interface SaveGenerationInput {
    topic: string;
    language: string;
    style: string;
    scenarios: Omit<Scenario, "id" | "project_id" | "created_at">[];
    compositions: MontageComposition[];
}

// POST /api/save-generation - Save complete generation to database
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

        const body: SaveGenerationInput = await request.json();
        const { topic, language, style, scenarios, compositions } = body;

        if (!topic || !scenarios || scenarios.length === 0) {
            return NextResponse.json(
                { success: false, error: "Topic and scenarios are required" },
                { status: 400 }
            );
        }

        // 1. Check credits
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

        // 2. Create project
        const project = await createProject({
            topic,
            video_count: scenarios.length,
            style: style as any,
            language,
        });

        // 3. Save scenarios
        const savedScenarios = await saveScenarios(project.id, scenarios);

        // 4. Create video records for each scenario
        const videoPromises = savedScenarios.map((scenario) =>
            createVideo({
                project_id: project.id,
                scenario_id: scenario.id,
                style,
                duration_seconds: scenario.duration_seconds,
            })
        );
        const savedVideos = await Promise.all(videoPromises);

        // 5. Update project status to completed
        await updateProjectStatus(project.id, "completed");

        // 6. Decrement credits
        await supabase
            .from("profiles")
            .update({ credits_remaining: profile.credits_remaining - 1 })
            .eq("id", user.id);

        return NextResponse.json({
            success: true,
            data: {
                project,
                scenarios: savedScenarios,
                videos: savedVideos,
                creditsRemaining: profile.credits_remaining - 1,
            },
        });
    } catch (error: any) {
        console.error("[API] Save Generation error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to save generation" },
            { status: 500 }
        );
    }
}
