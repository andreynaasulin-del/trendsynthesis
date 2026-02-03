// ============================================
// TRENDSYNTHESIS — Video Generation API
// POST /api/generate/video — Full pipeline execution
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runGenerationPipeline } from "@/lib/pipeline";
import { createProject, saveScenarios, createVideo, updateProjectStatus } from "@/lib/supabase/db";
import type { VideoStyle } from "@/types";

// Vercel Serverless Function Config
export const maxDuration = 60; // 60 seconds (max for Hobby plan)

interface GenerateVideoRequest {
    topic: string;
    video_count?: number;
    style?: VideoStyle;
    language?: string;
    save_to_db?: boolean;
}

// POST /api/generate/video - Run full generation pipeline
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

        const body: GenerateVideoRequest = await request.json();
        const {
            topic,
            video_count = 6,
            style = "cinematic",
            language = "en",
            save_to_db = true,
        } = body;

        if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: "Topic is required" },
                { status: 400 }
            );
        }

        // Check credits
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining, plan")
            .eq("id", user.id)
            .single();

        if (!profile || profile.credits_remaining < 1) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No credits remaining. Please upgrade your plan.",
                    code: "NO_CREDITS",
                },
                { status: 403 }
            );
        }

        console.log(`[API] Starting generation for user ${user.id}, topic: "${topic}"`);

        // 1. DEDUCT CREDIT FIRST (Atomic Security)
        const { error: deductError } = await supabase
            .from("profiles")
            .update({
                credits_remaining: profile.credits_remaining - 1,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        if (deductError) {
            return NextResponse.json(
                { success: false, error: "Failed to process credits" },
                { status: 500 }
            );
        }

        // 2. RUN PIPELINE (with Fail-Safe Refund)
        let result;
        try {
            result = await runGenerationPipeline({
                topic: topic.trim(),
                videoCount: Math.min(video_count, 30),
                style,
                language,
            });

            if (!result.success) throw new Error(result.error || "Pipeline failed");

        } catch (pipelineError: any) {
            console.error("[API] Pipeline Failed - REFUNDING CREDIT:", pipelineError);

            // REFUND CREDIT
            await supabase.rpc('increment_credits', { user_id: user.id, amount: 1 });

            return NextResponse.json(
                { success: false, error: pipelineError.message || "Generation failed. Credit refunded." },
                { status: 500 }
            );
        }

        // 3. SUCCESS - SAVE DATA
        let responseData: any = {
            scenarios: result.scenarios,
            compositions: result.compositions,
            stages: result.stages,
            count: result.compositions.length,
        };

        if (save_to_db) {
            // Create project
            const project = await createProject({
                topic,
                video_count: result.scenarios.length,
                style,
                language,
            });

            // Save scenarios
            const savedScenarios = await saveScenarios(project.id, result.scenarios);

            // Create video records
            const videoPromises = savedScenarios.map((scenario, index) =>
                createVideo({
                    project_id: project.id,
                    scenario_id: scenario.id,
                    style,
                    duration_seconds: scenario.duration_seconds,
                })
            );
            const savedVideos = await Promise.all(videoPromises);

            // Update project status
            await updateProjectStatus(project.id, "completed");

            // Log usage (Credit already deducted)
            await supabase.from("usage_logs").insert({
                user_id: user.id,
                action: "video_generation",
                credits_used: 1,
                metadata: {
                    topic,
                    success: true,
                    project_id: project.id,
                },
            });

            responseData = {
                ...responseData,
                project,
                saved_scenarios: savedScenarios,
                saved_videos: savedVideos,
                credits_remaining: profile.credits_remaining - 1,
            };

            console.log(`[API] Generation saved to project ${project.id}`);
        }

        return NextResponse.json({
            success: true,
            data: responseData,
        });

    } catch (error: any) {
        console.error("[API] Generate Video Critical Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "System error" },
            { status: 500 }
        );
    }
}

// GET /api/generate/video — Get generation capabilities & limits
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

        const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining, plan")
            .eq("id", user.id)
            .single();

        const planLimits: Record<string, { maxVideosPerGeneration: number; features: string[] }> = {
            free: {
                maxVideosPerGeneration: 3,
                features: ["Basic styles", "Pexels assets", "720p export"],
            },
            creator: {
                maxVideosPerGeneration: 20,
                features: ["All styles", "Premium assets", "1080p export", "Priority rendering"],
            },
            agency: {
                maxVideosPerGeneration: 30,
                features: ["All styles", "Premium assets", "4K export", "Priority rendering", "Custom branding", "API access"],
            },
        };

        const plan = profile?.plan || "free";

        return NextResponse.json({
            success: true,
            data: {
                credits_remaining: profile?.credits_remaining || 0,
                plan,
                limits: planLimits[plan] || planLimits.free,
                styles: ["cinematic", "dynamic", "minimal"],
                languages: ["en", "ru", "es", "de", "fr", "pt", "zh", "ja", "ko"],
            },
        });

    } catch (error: any) {
        console.error("[API] Get Generate Info Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to get info" },
            { status: 500 }
        );
    }
}
