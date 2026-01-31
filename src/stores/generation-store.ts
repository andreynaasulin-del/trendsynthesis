// ============================================
// TRENDSYNTHESIS — Generation Pipeline Store V2
// State Machine: idle → brainstorming → generating_scenarios → fetching_assets → composing → completed
// Batch Generation Support (up to 30 videos)
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ProjectStatus,
  Scenario,
  StrategyOption,
  VideoClip,
  MontageComposition,
  SubtitleSegment,
  PipelineStage,
  MontageStyle,
} from "@/types";

// --- Pipeline Stage Definitions ---
const PIPELINE_STAGES: Omit<PipelineStage, "status" | "progress" | "log" | "startedAt" | "completedAt">[] = [
  { id: "brainstorming", name: "AI Brainstorm", nameRu: "AI Анализ" },
  { id: "generating_scenarios", name: "Generating Scenarios", nameRu: "Генерация Сценариев" },
  { id: "fetching_assets", name: "Fetching Assets", nameRu: "Поиск Видео" },
  { id: "composing", name: "Composing Montage", nameRu: "Сборка Монтажа" },
];

// --- Default Montage Style ---
const DEFAULT_MONTAGE_STYLE: MontageStyle = {
  transition: "crossfade",
  kenBurns: true,
  overlayOpacity: 0.6,
  textPosition: "bottom",
  progressBar: true,
  watermark: true,
  colorGrade: "cyberpunk",
};

// --- Store State ---
interface GenerationState {
  // Current pipeline status
  status: ProjectStatus;
  topic: string;
  language: "en" | "ru";

  // Strategy from chat
  selectedStrategy: StrategyOption | null;

  // Pipeline stages (for UI tracking)
  stages: PipelineStage[];

  // Generated data
  scenarios: Scenario[];
  clips: Map<string, VideoClip[]>; // scenario_id -> clips
  compositions: MontageComposition[];

  // Batch Generation
  videoCount: number; // How many videos to generate (1-30)
  activeCompositionIndex: number; // Which composition is being previewed
  selectedScenarioIds: Set<string>; // Which scenarios are selected for batch

  // Settings
  montageStyle: MontageStyle;

  // Error
  error: string | null;

  // --- Actions ---
  setTopic: (topic: string) => void;
  setLanguage: (lang: "en" | "ru") => void;
  selectStrategy: (strategy: StrategyOption) => void;
  setMontageStyle: (style: Partial<MontageStyle>) => void;

  // Batch controls
  setVideoCount: (count: number) => void;
  setActiveCompositionIndex: (index: number) => void;
  toggleScenarioSelection: (scenarioId: string) => void;
  selectAllScenarios: () => void;
  deselectAllScenarios: () => void;

  // Pipeline control
  startPipeline: () => void;
  advanceStage: (stageId: string) => void;
  completeStage: (stageId: string) => void;
  failStage: (stageId: string, error: string) => void;
  addLog: (stageId: string, message: string) => void;
  updateStageProgress: (stageId: string, progress: number) => void;

  // Data setters
  setScenarios: (scenarios: Scenario[]) => void;
  setClipsForScenario: (scenarioId: string, clips: VideoClip[]) => void;
  setCompositions: (compositions: MontageComposition[]) => void;
  addComposition: (composition: MontageComposition) => void;

  // Pipeline completion
  completePipeline: () => void;
  failPipeline: (error: string) => void;
  reset: () => void;
}

// --- Helper: Build subtitle segments from scenario ---
export function buildSubtitles(scenario: Scenario, totalFrames: number, fps: number): SubtitleSegment[] {
  const segments: SubtitleSegment[] = [];

  // Phase distribution: Hook 20%, Body 60%, CTA 20%
  const hookEnd = Math.floor(totalFrames * 0.2);
  const bodyEnd = Math.floor(totalFrames * 0.8);

  // HOOK — single impact text
  segments.push({
    id: `sub-hook-${scenario.id}`,
    text: scenario.hook,
    startFrame: 0,
    endFrame: hookEnd,
    phase: "hook",
    style: "impact",
  });

  // BODY — split into sentences, distribute evenly
  const bodySentences = scenario.body
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const bodyFrames = bodyEnd - hookEnd;
  const sentenceDuration = Math.floor(bodyFrames / Math.max(bodySentences.length, 1));

  bodySentences.forEach((sentence, i) => {
    segments.push({
      id: `sub-body-${scenario.id}-${i}`,
      text: sentence,
      startFrame: hookEnd + i * sentenceDuration,
      endFrame: hookEnd + (i + 1) * sentenceDuration,
      phase: "body",
      style: i === 0 ? "highlight" : "default",
    });
  });

  // CTA — call to action
  segments.push({
    id: `sub-cta-${scenario.id}`,
    text: scenario.cta,
    startFrame: bodyEnd,
    endFrame: totalFrames,
    phase: "cta",
    style: "impact",
  });

  return segments;
}

// --- Helper: Build composition from scenario + clips ---
export function buildComposition(
  scenario: Scenario,
  clips: VideoClip[],
  style: MontageStyle,
  fps: number = 30
): MontageComposition {
  const durationFrames = scenario.duration_seconds * fps;

  return {
    id: `comp-${scenario.id}`,
    scenario,
    clips,
    subtitles: buildSubtitles(scenario, durationFrames, fps),
    style,
    duration_frames: durationFrames,
    fps,
    width: 1080,
    height: 1920,
  };
}

// --- Initialize clean stages ---
function createCleanStages(): PipelineStage[] {
  return PIPELINE_STAGES.map(s => ({
    ...s,
    status: "waiting" as const,
    progress: 0,
    log: [],
  }));
}

// --- The Store ---
export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: "idle",
      topic: "",
      language: "en",
      selectedStrategy: null,
      stages: createCleanStages(),
      scenarios: [],
      clips: new Map(),
      compositions: [],
      videoCount: 6,
      activeCompositionIndex: 0,
      selectedScenarioIds: new Set(),
      montageStyle: DEFAULT_MONTAGE_STYLE,
      error: null,

      // --- Simple setters ---
      setTopic: (topic) => set({ topic }),
      setLanguage: (language) => set({ language }),
      selectStrategy: (strategy) => set({ selectedStrategy: strategy }),
      setMontageStyle: (partial) =>
        set((state) => ({
          montageStyle: { ...state.montageStyle, ...partial },
        })),

      // --- Batch controls ---
      setVideoCount: (count) => set({ videoCount: Math.max(1, Math.min(30, count)) }),

      setActiveCompositionIndex: (index) =>
        set((state) => ({
          activeCompositionIndex: Math.max(0, Math.min(index, state.compositions.length - 1)),
        })),

      toggleScenarioSelection: (scenarioId) =>
        set((state) => {
          const updated = new Set(state.selectedScenarioIds);
          if (updated.has(scenarioId)) {
            updated.delete(scenarioId);
          } else {
            updated.add(scenarioId);
          }
          return { selectedScenarioIds: updated };
        }),

      selectAllScenarios: () =>
        set((state) => ({
          selectedScenarioIds: new Set(state.scenarios.map(s => s.id)),
        })),

      deselectAllScenarios: () => set({ selectedScenarioIds: new Set() }),

      // --- Pipeline control ---
      startPipeline: () =>
        set({
          status: "brainstorming",
          stages: createCleanStages(),
          scenarios: [],
          clips: new Map(),
          compositions: [],
          activeCompositionIndex: 0,
          selectedScenarioIds: new Set(),
          error: null,
        }),

      advanceStage: (stageId) =>
        set((state) => ({
          status: stageId as ProjectStatus,
          stages: state.stages.map((s) =>
            s.id === stageId
              ? { ...s, status: "active" as const, startedAt: Date.now() }
              : s
          ),
        })),

      completeStage: (stageId) =>
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId
              ? { ...s, status: "completed" as const, progress: 100, completedAt: Date.now() }
              : s
          ),
        })),

      failStage: (stageId, error) =>
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId
              ? { ...s, status: "failed" as const, log: [...s.log, `ERROR: ${error}`] }
              : s
          ),
        })),

      addLog: (stageId, message) =>
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId
              ? { ...s, log: [...s.log, message] }
              : s
          ),
        })),

      updateStageProgress: (stageId, progress) =>
        set((state) => ({
          stages: state.stages.map((s) =>
            s.id === stageId ? { ...s, progress } : s
          ),
        })),

      // --- Data setters ---
      setScenarios: (scenarios) =>
        set({
          scenarios,
          // Auto-select all scenarios when they arrive
          selectedScenarioIds: new Set(scenarios.map(s => s.id)),
        }),

      setClipsForScenario: (scenarioId, newClips) =>
        set((state) => {
          const updated = new Map(state.clips);
          updated.set(scenarioId, newClips);
          return { clips: updated };
        }),

      setCompositions: (compositions) => set({ compositions }),

      addComposition: (composition) =>
        set((state) => ({
          compositions: [...state.compositions, composition],
        })),

      // --- Pipeline completion ---
      completePipeline: () => set({ status: "completed" }),

      failPipeline: (error) => set({ status: "failed", error }),

      reset: () =>
        set({
          status: "idle",
          topic: "",
          selectedStrategy: null,
          stages: createCleanStages(),
          scenarios: [],
          clips: new Map(),
          compositions: [],
          activeCompositionIndex: 0,
          selectedScenarioIds: new Set(),
          error: null,
        }),
    }),
    {
      name: "trendsynthesis-generation",
      partialize: (state) => ({
        topic: state.topic,
        language: state.language,
        videoCount: state.videoCount,
        montageStyle: state.montageStyle,
      }),
    }
  )
);
