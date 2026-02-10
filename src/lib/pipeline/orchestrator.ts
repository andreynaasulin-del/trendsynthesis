// ============================================
// TRENDSYNTHESIS — Pipeline Orchestrator
// Coordinates full video generation pipeline
// ============================================

import type { Scenario, MontageComposition, VideoStyle, PipelineStage, ProjectStatus } from "@/types";
import { generateScenarios } from "@/lib/openai/generate-scenarios";
import { buildCompositions } from "./composition-builder";

// --- Pipeline Stage Definitions ---
export const PIPELINE_STAGES: PipelineStage[] = [
    { id: "brainstorming", name: "Brainstorming", nameRu: "Генерация идей", status: "waiting", progress: 0, log: [] },
    { id: "generating_scenarios", name: "Writing Scripts", nameRu: "Написание сценариев", status: "waiting", progress: 0, log: [] },
    { id: "fetching_assets", name: "Fetching Assets", nameRu: "Поиск ассетов", status: "waiting", progress: 0, log: [] },
    { id: "composing", name: "Building Compositions", nameRu: "Сборка видео", status: "waiting", progress: 0, log: [] },
];

// --- Pipeline Result ---
export interface PipelineResult {
    success: boolean;
    scenarios: Scenario[];
    compositions: MontageComposition[];
    error?: string;
    stages: PipelineStage[];
}

// --- Progress Callback Type ---
export type ProgressCallback = (
    stage: ProjectStatus,
    progress: number,
    message: string
) => void;

// --- Main Orchestrator ---
export async function runGenerationPipeline(params: {
    topic: string;
    videoCount?: number;
    style?: VideoStyle;
    language?: string;
    userPlan?: string; // "free" | "creator" | "pro" | "agency"
    onProgress?: ProgressCallback;
}): Promise<PipelineResult> {
    const {
        topic,
        videoCount = 6,
        style = "cinematic",
        language = "en",
        userPlan = "free",
        onProgress,
    } = params;

    const stages = JSON.parse(JSON.stringify(PIPELINE_STAGES)) as PipelineStage[];
    let scenarios: Scenario[] = [];
    let compositions: MontageComposition[] = [];

    const updateStage = (stageId: string, updates: Partial<PipelineStage>) => {
        const stage = stages.find(s => s.id === stageId);
        if (stage) {
            Object.assign(stage, updates);
            if (onProgress && stage.status === "active") {
                onProgress(stageId as ProjectStatus, stage.progress, stage.log[stage.log.length - 1] || "");
            }
        }
    };

    try {
        // ===== STAGE 1: BRAINSTORMING =====
        updateStage("brainstorming", {
            status: "active",
            progress: 0,
            log: ["Analyzing topic trends..."],
            startedAt: Date.now(),
        });
        onProgress?.("brainstorming", 10, `Analyzing "${topic}"...`);

        // Simulate brief analysis phase (in reality, could add trend research)
        await new Promise(resolve => setTimeout(resolve, 500));

        updateStage("brainstorming", {
            progress: 100,
            status: "completed",
            log: ["Topic analysis complete", `Generating ${videoCount} unique angles`],
            completedAt: Date.now(),
        });

        // ===== STAGE 2: GENERATING SCENARIOS =====
        updateStage("generating_scenarios", {
            status: "active",
            progress: 0,
            log: ["Calling AI to write viral scripts..."],
            startedAt: Date.now(),
        });
        onProgress?.("generating_scenarios", 0, "Writing viral scripts with AI...");

        scenarios = await generateScenarios({
            topic,
            videoCount,
            language,
        });

        updateStage("generating_scenarios", {
            progress: 100,
            status: "completed",
            log: [`Generated ${scenarios.length} scenarios`],
            completedAt: Date.now(),
        });
        onProgress?.("generating_scenarios", 100, `${scenarios.length} scripts ready`);

        // ===== STAGE 3: FETCHING ASSETS =====
        updateStage("fetching_assets", {
            status: "active",
            progress: 0,
            log: ["Searching Pexels for video clips..."],
            startedAt: Date.now(),
        });
        onProgress?.("fetching_assets", 0, "Searching stock footage...");

        // Build compositions (this fetches assets internally)
        const totalScenarios = scenarios.length;
        let processedCount = 0;

        // Process with progress updates
        compositions = [];
        for (const scenario of scenarios) {
            const composition = await (await import("./composition-builder")).buildComposition(scenario, style, userPlan);
            compositions.push(composition);
            processedCount++;

            const progress = Math.round((processedCount / totalScenarios) * 100);
            updateStage("fetching_assets", {
                progress,
                log: [`Fetched assets for ${processedCount}/${totalScenarios} videos`],
            });
            onProgress?.("fetching_assets", progress, `Fetched ${processedCount}/${totalScenarios} assets`);

            // Rate limit protection
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        updateStage("fetching_assets", {
            progress: 100,
            status: "completed",
            log: [`All assets fetched: ${compositions.reduce((sum, c) => sum + c.clips.length, 0)} clips total`],
            completedAt: Date.now(),
        });

        // ===== STAGE 4: COMPOSING =====
        updateStage("composing", {
            status: "active",
            progress: 0,
            log: ["Building Remotion compositions..."],
            startedAt: Date.now(),
        });
        onProgress?.("composing", 50, "Building video compositions...");

        // Compositions are already built, just finalize
        await new Promise(resolve => setTimeout(resolve, 300));

        updateStage("composing", {
            progress: 100,
            status: "completed",
            log: [`${compositions.length} compositions ready for rendering`],
            completedAt: Date.now(),
        });
        onProgress?.("completed", 100, "Pipeline complete!");

        return {
            success: true,
            scenarios,
            compositions,
            stages,
        };

    } catch (error: any) {
        console.error("[Pipeline] Error:", error);

        // Mark current active stage as failed
        const activeStage = stages.find(s => s.status === "active");
        if (activeStage) {
            activeStage.status = "failed";
            activeStage.log.push(`Error: ${error.message}`);
        }

        return {
            success: false,
            scenarios,
            compositions,
            error: error.message || "Pipeline failed",
            stages,
        };
    }
}

// --- Render Queue Manager (for future Lambda integration) ---
export interface RenderJob {
    id: string;
    composition: MontageComposition;
    status: "queued" | "rendering" | "completed" | "failed";
    progress: number;
    output_url?: string;
}

export function createRenderQueue(compositions: MontageComposition[]): RenderJob[] {
    return compositions.map(composition => ({
        id: composition.id,
        composition,
        status: "queued" as const,
        progress: 0,
    }));
}
