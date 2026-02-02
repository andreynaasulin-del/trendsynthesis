"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { ViralChat } from "@/components/chat/ViralChat";
import { ScenarioGallery } from "@/components/generate/ScenarioGallery";
import { VideoCarousel } from "@/components/generate/VideoCarousel";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Film,
  Search,
  Layers,
  RotateCcw,
  Settings2,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  TerminalSquare
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGenerationStore, buildComposition } from "@/stores/generation-store";
import type { StrategyOption, Scenario } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProfile, updateProfile } from "@/lib/api-client"; // Assume these exist
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Pipeline Stage Icons ---
const STAGE_ICONS: Record<string, React.ElementType> = {
  brainstorming: Zap,
  generating_scenarios: Layers,
  fetching_assets: Search,
  composing: Film,
};

// --- Video Count Presets ---
const COUNT_PRESETS = [3, 6, 10, 15, 30];

// --- Pipeline Stage Card ---
function StageCard({ stage, language }: { stage: any; language: "en" | "ru" }) {
  const Icon = STAGE_ICONS[stage.id] || Zap;
  const name = language === "ru" ? stage.nameRu : stage.name;

  const statusColors: Record<string, string> = {
    waiting: "border-zinc-800 text-zinc-600",
    active: "border-zinc-700 text-white bg-zinc-800/50",
    completed: "border-zinc-700 text-zinc-400",
    failed: "border-zinc-800 text-zinc-500",
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-2.5 transition-all ${statusColors[stage.status]}`}
    >
      <div className="shrink-0">
        {stage.status === "active" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : stage.status === "completed" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : stage.status === "failed" ? (
          <XCircle className="h-3.5 w-3.5" />
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono font-medium truncate">{name}</p>
        {stage.status === "active" && (
          <Progress value={stage.progress} className="h-0.5 mt-1" />
        )}
      </div>
      {stage.status === "completed" && stage.completedAt && stage.startedAt && (
        <span className="text-[9px] font-mono text-zinc-500">
          {((stage.completedAt - stage.startedAt) / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  );
}

// --- Terminal Log (Task #4: Collapsible & Hidden by Default) ---
function TerminalLog({ stages, language }: { stages: any[]; language: "en" | "ru" }) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allLogs = stages.flatMap((s) =>
    s.log.map((msg: string) => ({ stageId: s.id, msg }))
  );

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allLogs.length, isOpen]);

  return (
    <div className="w-full mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors w-full px-1 py-1"
      >
        <TerminalSquare className="h-3 w-3" />
        <span>{language === "ru" ? "Лог процесса" : "Debug Console"}</span>
        <div className="h-px bg-zinc-800 flex-1" />
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {isOpen && (
        <div
          ref={scrollRef}
          className="w-full h-32 overflow-y-auto rounded-lg border border-zinc-800 bg-black/80 p-3 font-mono text-[10px] text-zinc-500 scrollbar-thin scrollbar-thumb-zinc-800 mt-2"
        >
          <span className="text-green-500 block mb-2">$ trendsynthesis pipeline --verbose</span>
          {allLogs.map((log, i) => (
            <div key={i} className="leading-5 font-mono">
              <span className="text-zinc-600 mr-2">[{log.stageId.substring(0, 4)}]</span>
              <span
                className={
                  log.msg.startsWith("ERROR")
                    ? "text-red-400"
                    : log.msg.startsWith("✓")
                      ? "text-emerald-400"
                      : "text-zinc-400"
                }
              >
                {log.msg}
              </span>
            </div>
          ))}
          {allLogs.length === 0 && (
            <span className="text-zinc-700 animate-pulse">
              ...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// --- Video Count Selector ---
function VideoCountSelector({
  count,
  onChange,
  language,
  disabled,
}: {
  count: number;
  onChange: (n: number) => void;
  language: "en" | "ru";
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <Settings2 className="h-4 w-4 text-zinc-500 shrink-0" />
      <div className="flex-1">
        <p className="text-[10px] font-mono text-zinc-400 mb-1.5">
          {language === "ru" ? "КОЛИЧЕСТВО ВИДЕО" : "VIDEO COUNT"}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {COUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => onChange(preset)}
                disabled={disabled}
                className={`
                  h-6 min-w-[24px] rounded px-1.5 text-[10px] font-mono transition-all border
                  ${count === preset
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-800 hover:text-zinc-300"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChange(count - 1)}
              disabled={disabled || count <= 1}
              className="h-6 w-6 flex items-center justify-center rounded border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-mono w-6 text-center text-zinc-300">
              {count}
            </span>
            <button
              onClick={() => onChange(count + 1)}
              disabled={disabled || count >= 30}
              className="h-6 w-6 flex items-center justify-center rounded border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function GeneratePage() {
  const store = useGenerationStore();
  const {
    language,
    status,
    scenarios,
    compositions,
    videoCount,
    stages,
    activeCompositionIndex,
    error,
    selectedStrategy,
    selectedScenarioIds,
    montageStyle,
  } = store;

  // Local UI state
  const [rightTab, setRightTab] = useState<"pipeline" | "gallery" | "preview">("pipeline");

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ niche: "", goal: "" });

  const isIdle = status === "idle";
  const isRunning = status !== "idle" && status !== "completed" && status !== "failed";
  const isFailed = status === "failed";
  const isDone = status === "completed";

  const totalProgress = Math.round(
    stages.reduce((acc, s) => acc + s.progress, 0) / stages.length
  );

  // Check Profile for Onboarding (Task #5)
  useEffect(() => {
    async function checkProfile() {
      try {
        const { data: profile } = await fetchProfile();
        if (profile && (!profile.niche || !profile.goal)) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.warn("Profile check failed", e);
      }
    }
    checkProfile();
  }, []);

  const handleOnboardingSubmit = async () => {
    if (!onboardingData.niche.trim() || !onboardingData.goal.trim()) return;

    try {
      await updateProfile({
        niche: onboardingData.niche,
        goal: onboardingData.goal
      });
      setShowOnboarding(false);
    } catch (e) {
      console.error("Failed to save onboarding", e);
    }
  };

  // Switch tabs automatically based on status
  useEffect(() => {
    if (status === "brainstorming" || status === "generating_scenarios") {
      setRightTab("pipeline");
    } else if (status === "completed") {
      // Stay on pipeline to show success, user clicks to preview
    }
  }, [status]);

  const runPipeline = useCallback(
    async (strategy: StrategyOption) => {
      if (isRunning) return;

      store.selectStrategy(strategy);
      store.startPipeline();
      setRightTab("pipeline");

      try {
        store.advanceStage("brainstorming");
        store.addLog("brainstorming", `Strategy selected: ${strategy.title}`);
        await new Promise((r) => setTimeout(r, 800)); // Fake think time
        store.updateStageProgress("brainstorming", 100);
        store.completeStage("brainstorming");

        // STAGE 2: GENERATE SCENARIOS
        store.advanceStage("generating_scenarios");
        store.addLog("generating_scenarios", `Generating ${videoCount} scripts for: ${strategy.hook_text}`);

        // Fetch creator settings to inject into prompt
        const { data: profile } = await fetchProfile().catch(() => ({ data: null }));

        const scenarioRes = await fetch("/api/generate/scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: strategy.hook_text,
            videoCount,
            language,
            creatorSettings: profile ? {
              systemPrompt: profile.system_prompt,
              targetAudience: profile.target_audience,
              videoExamples: profile.video_examples,
              // Inject Task #5 Onboarding Data
              niche: profile.niche,
              goal: profile.goal
            } : undefined
          }),
        });

        if (!scenarioRes.ok) throw new Error("Scenario generation failed");

        const scenarioData = await scenarioRes.json();
        if (!scenarioData.success) throw new Error(scenarioData.error || "Scenario error");

        const generatedScenarios: Scenario[] = scenarioData.data.scenarios;
        store.setScenarios(generatedScenarios);
        store.addLog("generating_scenarios", `✓ ${generatedScenarios.length} scenarios ready`);
        store.updateStageProgress("generating_scenarios", 100);
        store.completeStage("generating_scenarios");

        // STAGE 3: FETCH ASSETS
        store.advanceStage("fetching_assets");

        // --- TASK #3: Apply Global Style Filter ---
        const STYLE_SUFFIX = " cinematic, 4k, hyper-realistic, dark mode, high quality";

        const allQueries = generatedScenarios.flatMap((s) =>
          (s.asset_queries?.length > 0 ? s.asset_queries.slice(0, 2) : [s.hook]).map(q => q + STYLE_SUFFIX)
        );

        store.addLog("fetching_assets", `Searching visual assets for ${generatedScenarios.length} videos...`);
        store.updateStageProgress("fetching_assets", 10);

        const BATCH_SIZE = 15;
        let allGrouped: any[] = [];
        let allFlatAssets: string[] = [];

        for (let i = 0; i < allQueries.length; i += BATCH_SIZE) {
          const batch = allQueries.slice(i, i + BATCH_SIZE);
          const ingestRes = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              queries: batch,
              clips_per_query: 3,
              upload: false,
            }),
          });

          if (!ingestRes.ok) throw new Error(`Ingest batch ${i / BATCH_SIZE + 1} failed`);

          const ingestData = await ingestRes.json();
          if (!ingestData.success) throw new Error(ingestData.error || "Ingest error");

          allGrouped.push(...(ingestData.grouped || []));
          allFlatAssets.push(...(ingestData.assets || []));

          const batchProgress = Math.round(((i + batch.length) / allQueries.length) * 90) + 10;
          store.updateStageProgress("fetching_assets", batchProgress);
          store.addLog("fetching_assets", `✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Found ${ingestData.meta?.total_clips || batch.length * 2} assets`);
        }

        store.addLog("fetching_assets", `✓ Total assets acquired: ${allFlatAssets.length}`);
        store.updateStageProgress("fetching_assets", 100);
        store.completeStage("fetching_assets");

        // STAGE 4: COMPOSE MONTAGES
        store.advanceStage("composing");
        store.addLog("composing", `Assembling ${generatedScenarios.length} edits...`);

        generatedScenarios.forEach((scenario, idx) => {
          const queryStartIdx = idx * 2;
          const scenarioClips: string[] = [];

          for (let q = queryStartIdx; q < queryStartIdx + 2 && q < allGrouped.length; q++) {
            scenarioClips.push(...(allGrouped[q]?.assets || []));
          }

          const finalClips =
            scenarioClips.length > 0
              ? scenarioClips
              : allFlatAssets.slice(idx * 4, idx * 4 + 4);

          const safeClips = finalClips.length > 0 ? finalClips : allFlatAssets.slice(0, 4);

          const clipObjects = safeClips.map((url: string, i: number) => ({
            id: `clip-${scenario.id}-${i}`,
            url,
            provider: "pexels" as const,
            query: allQueries[queryStartIdx] || scenario.hook,
            width: 1080,
            height: 1920,
          }));

          store.setClipsForScenario(scenario.id, clipObjects);

          const comp = buildComposition(scenario, clipObjects, montageStyle);
          store.addComposition(comp);

          const progress = Math.round(((idx + 1) / generatedScenarios.length) * 100);
          store.updateStageProgress("composing", progress);
        });

        store.completeStage("composing");
        store.completePipeline();
        store.addLog("composing", `✓ All ${generatedScenarios.length} videos rendered successfully!`);

      } catch (err: any) {
        console.error("[Pipeline] Error:", err);
        const activeStage = stages.find((s) => s.status === "active");
        if (activeStage) store.failStage(activeStage.id, err.message);
        store.failPipeline(err.message);
      }
    },
    [store, language, stages, montageStyle, videoCount, isRunning] // Added isRunning dependency
  );

  const handleStrategySelect = useCallback(
    (strategy: StrategyOption) => {
      runPipeline(strategy);
    },
    [runPipeline]
  );

  return (
    <div className="flex h-full flex-col gap-3 p-2 md:p-4 lg:p-5">
      {/* Onboarding Dialog (Task #5) */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Welcome to TrendSynthesis</DialogTitle>
            <DialogDescription className="text-zinc-500">
              To tailor the AI to your brand, please tell us a bit about yourself.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Your Niche</Label>
              <Input
                id="niche"
                placeholder="e.g. Real Estate, Crypto, Fitness..."
                className="bg-zinc-900 border-zinc-800"
                value={onboardingData.niche}
                onChange={(e) => setOnboardingData({ ...onboardingData, niche: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Main Goal</Label>
              <Input
                id="goal"
                placeholder="e.g. Get Leads, Viral Views, Sell Course..."
                className="bg-zinc-900 border-zinc-800"
                value={onboardingData.goal}
                onChange={(e) => setOnboardingData({ ...onboardingData, goal: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOnboardingSubmit} className="bg-white text-black hover:bg-zinc-200">
              Start Creating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {language === "ru" ? "Генератор" : "Generator"}
          </h1>
          <p className="text-xs text-zinc-500">
            {language === "ru"
              ? `AI → ${videoCount} Сценариев → Монтаж`
              : `AI → ${videoCount} Scenarios → Montage`}
          </p>
        </div>
        <div className="flex gap-2">
          {!isIdle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => store.reset()}
              className="gap-1.5 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {language === "ru" ? "Сброс" : "Reset"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        {/* ===== LEFT: Chat + Settings ===== */}
        <div className="flex flex-col gap-3 min-h-0">
          {(isIdle || isFailed) && (
            <VideoCountSelector
              count={videoCount}
              onChange={store.setVideoCount}
              language={language}
              disabled={isRunning}
            />
          )}
          <ViralChat onStrategySelect={handleStrategySelect} />
        </div>

        {/* ===== RIGHT: Pipeline / Gallery / Preview ===== */}
        <div className="flex flex-col rounded-xl border border-zinc-800 bg-black/40 backdrop-blur-sm min-h-[300px] lg:min-h-[700px] overflow-hidden">
          {/* Tab Bar */}
          {!isIdle && (
            <div className="flex border-b border-zinc-800 bg-zinc-900/30">
              {[
                { id: "pipeline" as const, label: language === "ru" ? "Процесс" : "Pipeline", icon: Zap },
                { id: "gallery" as const, label: language === "ru" ? "Сценарии" : "Scenarios", icon: Layers, count: scenarios.length },
                { id: "preview" as const, label: language === "ru" ? "Превью" : "Preview", icon: Film, count: compositions.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2.5 text-xs transition-all border-b-2
                    ${rightTab === tab.id
                      ? "border-white text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }
                  `}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 text-[9px] bg-zinc-800 px-1 py-0.5 rounded">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800">
            <AnimatePresence mode="wait">
              {/* === IDLE === */}
              {isIdle && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center text-center gap-4 h-full min-h-[400px]"
                >
                  <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Film className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">
                      {language === "ru" ? "Генератор Видео" : "AI Video Generator"}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {language === "ru"
                        ? "Опишите нишу слева, чтобы начать"
                        : "Describe your niche on the left to start"}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* === PIPELINE TAB === */}
              {!isIdle && rightTab === "pipeline" && (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  {/* Pipeline Header */}
                  {selectedStrategy && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-semibold text-foreground">
                          {isDone
                            ? language === "ru" ? "✓ Готово" : "✓ Complete"
                            : isFailed
                              ? language === "ru" ? "✕ Ошибка" : "✕ Failed"
                              : language === "ru" ? "Генерация..." : "Generating..."}
                        </h3>
                        <p className="text-[9px] text-zinc-500 font-mono truncate max-w-[200px]">
                          {selectedStrategy.title}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-white">
                        {totalProgress}%
                      </span>
                    </div>
                  )}

                  <Progress value={totalProgress} className="h-1 bg-zinc-900" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {stages.map((stage) => (
                      <StageCard key={stage.id} stage={stage} language={language} />
                    ))}
                  </div>

                  <TerminalLog stages={stages} language={language} />

                  {isFailed && error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 mt-2">
                      <p className="text-[10px] font-mono text-red-400">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-[10px] h-6 border-red-900/30 text-red-400 hover:bg-red-900/20"
                        onClick={() => selectedStrategy && runPipeline(selectedStrategy)}
                      >
                        {language === "ru" ? "Повторить" : "Retry"}
                      </Button>
                    </div>
                  )}

                  {isDone && (
                    <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-center">
                      <p className="text-xs text-zinc-400 mb-3">
                        {language === "ru"
                          ? `Успешно создано ${compositions.length} видео`
                          : `Successfully created ${compositions.length} videos`}
                      </p>
                      <Button
                        className="w-full bg-white text-black hover:bg-zinc-200 h-9 text-xs"
                        onClick={() => setRightTab("preview")}
                      >
                        <Film className="h-3 w-3 mr-2" />
                        {language === "ru" ? "Смотреть Результат" : "Watch Results"}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* === GALLERY TAB === */}
              {!isIdle && rightTab === "gallery" && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <ScenarioGallery
                    scenarios={scenarios}
                    compositions={compositions}
                    selectedIds={selectedScenarioIds}
                    onToggle={store.toggleScenarioSelection}
                    onSelectAll={store.selectAllScenarios}
                    onDeselectAll={store.deselectAllScenarios}
                    onPreview={(idx) => {
                      store.setActiveCompositionIndex(idx);
                      setRightTab("preview");
                    }}
                    language={language}
                  />
                </motion.div>
              )}

              {/* === PREVIEW TAB === */}
              {!isIdle && rightTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <VideoCarousel
                    compositions={compositions}
                    activeIndex={activeCompositionIndex}
                    onChangeIndex={store.setActiveCompositionIndex}
                    language={language}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
