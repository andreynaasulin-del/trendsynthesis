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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGenerationStore, buildComposition } from "@/stores/generation-store";
import type { StrategyOption, Scenario } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

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
    active: "border-primary/50 text-primary bg-primary/5",
    completed: "border-green-500/30 text-green-400",
    failed: "border-red-500/30 text-red-400",
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

// --- Terminal Log ---
function TerminalLog({ stages, language }: { stages: any[]; language: "en" | "ru" }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const allLogs = stages.flatMap((s) =>
    s.log.map((msg: string) => ({ stageId: s.id, msg }))
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allLogs.length]);

  return (
    <div
      ref={scrollRef}
      className="w-full h-28 overflow-y-auto rounded-lg border border-zinc-800 bg-black/60 p-2.5 font-mono text-[10px] text-zinc-500 scrollbar-thin scrollbar-thumb-zinc-800"
    >
      <span className="text-green-500">$ trendsynthesis pipeline --batch{"\n"}</span>
      {allLogs.map((log, i) => (
        <div key={i} className="leading-4">
          <span className="text-zinc-700">[{log.stageId}]</span>{" "}
          <span
            className={
              log.msg.startsWith("ERROR")
                ? "text-red-400"
                : log.msg.startsWith("✓")
                  ? "text-green-400"
                  : "text-zinc-400"
            }
          >
            {log.msg}
          </span>
        </div>
      ))}
      {allLogs.length === 0 && (
        <span className="text-zinc-700 animate-pulse">
          {language === "ru" ? "Ожидание запуска..." : "Awaiting pipeline start..."}
        </span>
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
          {/* Presets */}
          <div className="flex gap-1">
            {COUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => onChange(preset)}
                disabled={disabled}
                className={`
                  px-2 py-0.5 text-[10px] font-mono rounded border transition-all
                  ${count === preset
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom +/- */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onChange(count - 1)}
              disabled={disabled || count <= 1}
              className="h-5 w-5 rounded border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-mono font-bold text-zinc-200 w-7 text-center">
              {count}
            </span>
            <button
              onClick={() => onChange(count + 1)}
              disabled={disabled || count >= 30}
              className="h-5 w-5 rounded border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function GeneratePage() {
  const store = useGenerationStore();
  const {
    status,
    language,
    selectedStrategy,
    stages,
    scenarios,
    compositions,
    montageStyle,
    videoCount,
    activeCompositionIndex,
    selectedScenarioIds,
    error,
  } = store;

  // Right panel tab state: "pipeline" | "gallery" | "preview"
  const [rightTab, setRightTab] = useState<"pipeline" | "gallery" | "preview">("pipeline");

  // Total pipeline progress
  const totalProgress = Math.round(
    stages.reduce((sum, s) => sum + s.progress, 0) / stages.length
  );

  const isIdle = status === "idle";
  const isRunning = ["brainstorming", "generating_scenarios", "fetching_assets", "composing"].includes(status);
  const isDone = status === "completed";
  const isFailed = status === "failed";

  // Auto-switch to gallery when scenarios arrive, preview when done
  useEffect(() => {
    if (isDone && compositions.length > 0) setRightTab("preview");
    else if (scenarios.length > 0 && !isDone) setRightTab("gallery");
    else if (isRunning) setRightTab("pipeline");
  }, [isDone, scenarios.length, compositions.length, isRunning]);

  // --- Run the real pipeline ---
  const runPipeline = useCallback(
    async (strategy: StrategyOption) => {
      store.selectStrategy(strategy);
      store.startPipeline();
      setRightTab("pipeline");

      try {
        // STAGE 1: BRAINSTORMING
        store.advanceStage("brainstorming");
        store.addLog("brainstorming", `Strategy: "${strategy.title}"`);
        store.addLog("brainstorming", `Hook: "${strategy.hook_text}"`);
        store.addLog("brainstorming", `Batch size: ${videoCount} videos`);
        store.updateStageProgress("brainstorming", 100);
        store.completeStage("brainstorming");

        // STAGE 2: GENERATE SCENARIOS
        store.advanceStage("generating_scenarios");
        store.addLog("generating_scenarios", `Generating ${videoCount} scenarios via GPT-4o...`);
        store.updateStageProgress("generating_scenarios", 20);

        const scenarioRes = await fetch("/api/generate/scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: strategy.hook_text,
            videoCount,
            language,
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

        // STAGE 3: FETCH ASSETS (batch — all queries from all scenarios)
        store.advanceStage("fetching_assets");

        const allQueries = generatedScenarios.flatMap((s) =>
          s.asset_queries?.length > 0 ? s.asset_queries.slice(0, 2) : [s.hook]
        );

        store.addLog("fetching_assets", `Searching ${allQueries.length} queries...`);
        store.updateStageProgress("fetching_assets", 10);

        // Batch in chunks to avoid overwhelming Pexels (max 15 queries per call)
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
              clips_per_query: 2,
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
          store.addLog("fetching_assets", `✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${ingestData.meta?.total_clips || batch.length * 2} clips`);
        }

        store.addLog("fetching_assets", `✓ Total: ${allFlatAssets.length} clips acquired`);
        store.updateStageProgress("fetching_assets", 100);
        store.completeStage("fetching_assets");

        // STAGE 4: COMPOSE MONTAGES
        store.advanceStage("composing");
        store.addLog("composing", `Composing ${generatedScenarios.length} montages...`);

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

          // Ensure we always have at least some clips
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

          if (idx < 5 || idx === generatedScenarios.length - 1) {
            store.addLog("composing", `✓ #${idx + 1} "${scenario.title.slice(0, 40)}..." (${safeClips.length} clips)`);
          } else if (idx === 5) {
            store.addLog("composing", `... composing ${generatedScenarios.length - 5} more ...`);
          }
        });

        store.completeStage("composing");
        store.completePipeline();
        store.addLog("composing", `✓ All ${generatedScenarios.length} compositions ready!`);

      } catch (err: any) {
        console.error("[Pipeline] Error:", err);
        const activeStage = stages.find((s) => s.status === "active");
        if (activeStage) store.failStage(activeStage.id, err.message);
        store.failPipeline(err.message);
      }
    },
    [store, language, stages, montageStyle, videoCount]
  );

  const handleStrategySelect = useCallback(
    (strategy: StrategyOption) => {
      runPipeline(strategy);
    },
    [runPipeline]
  );

  return (
    <div className="flex h-full flex-col gap-3 p-4 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {language === "ru" ? "Генератор" : "Generator"}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            {language === "ru"
              ? `AI → ${videoCount} Сценариев → Ассеты → Монтаж`
              : `AI → ${videoCount} Scenarios → Assets → Montage`}
          </p>
        </div>
        <div className="flex gap-2">
          {!isIdle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => store.reset()}
              className="gap-1.5 font-mono text-[10px] h-7"
            >
              <RotateCcw className="h-3 w-3" />
              {language === "ru" ? "СБРОС" : "RESET"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-2 min-h-0">
        {/* ===== LEFT: Chat + Settings ===== */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Video Count Selector (only when idle or can change) */}
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
        <div className="flex flex-col rounded-xl border border-zinc-800 bg-black/40 backdrop-blur-sm min-h-[700px] overflow-hidden">
          {/* Tab Bar (when there's content) */}
          {!isIdle && (
            <div className="flex border-b border-zinc-800 bg-zinc-900/30">
              {[
                { id: "pipeline" as const, label: language === "ru" ? "Pipeline" : "Pipeline", icon: Zap },
                { id: "gallery" as const, label: language === "ru" ? "Сценарии" : "Scenarios", icon: Layers, count: scenarios.length },
                { id: "preview" as const, label: language === "ru" ? "Превью" : "Preview", icon: Film, count: compositions.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-mono transition-all border-b-2
                    ${rightTab === tab.id
                      ? "border-primary text-primary"
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
          <div className="flex-1 overflow-y-auto p-4">
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
                  <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Film className="h-8 w-8 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 font-mono">
                      {language === "ru"
                        ? `Готов сгенерировать ${videoCount} видео`
                        : `Ready to generate ${videoCount} videos`}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-1">
                      {language === "ru"
                        ? "Опишите тему в чате →"
                        : "Describe your topic in chat →"}
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
                  {/* Header */}
                  {selectedStrategy && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-xs font-semibold text-foreground">
                          {isDone
                            ? language === "ru" ? "✓ Готово" : "✓ Complete"
                            : isFailed
                              ? language === "ru" ? "✕ Ошибка" : "✕ Failed"
                              : language === "ru" ? "Генерация..." : "Generating..."}
                        </h3>
                        <p className="text-[9px] text-zinc-500 font-mono truncate max-w-[250px]">
                          {selectedStrategy.title} · {videoCount} {language === "ru" ? "видео" : "videos"}
                        </p>
                      </div>
                      <span className="text-lg font-bold font-mono text-primary">
                        {totalProgress}%
                      </span>
                    </div>
                  )}

                  <Progress value={totalProgress} className="h-1.5" />

                  <div className="grid grid-cols-2 gap-1.5">
                    {stages.map((stage) => (
                      <StageCard key={stage.id} stage={stage} language={language} />
                    ))}
                  </div>

                  <TerminalLog stages={stages} language={language} />

                  {isFailed && error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                      <p className="text-[10px] font-mono text-red-400">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-[10px] h-6"
                        onClick={() => selectedStrategy && runPipeline(selectedStrategy)}
                      >
                        {language === "ru" ? "Повторить" : "Retry"}
                      </Button>
                    </div>
                  )}

                  {isDone && (
                    <div className="text-center">
                      <p className="text-[10px] font-mono text-green-400">
                        {language === "ru"
                          ? `${compositions.length} композиций готово!`
                          : `${compositions.length} compositions ready!`}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-[10px] h-7 gap-1"
                        onClick={() => setRightTab("preview")}
                      >
                        <Film className="h-3 w-3" />
                        {language === "ru" ? "Смотреть" : "Watch"}
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
                >
                  {scenarios.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-xs font-mono text-zinc-600">
                        {language === "ru"
                          ? "Сценарии генерируются..."
                          : "Generating scenarios..."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* === PREVIEW TAB === */}
              {!isIdle && rightTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
