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
  TerminalSquare,
  MessageSquare,
  LayoutTemplate
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGenerationStore, buildComposition } from "@/stores/generation-store";
import type { StrategyOption, Scenario } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProfile, updateProfile } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Pipeline Stage Icons ---
const STAGE_ICONS: Record<string, React.ElementType> = {
  brainstorming: Zap,
  generating_scenarios: Layers,
  fetching_assets: Search,
  composing: Film,
};

// --- Video Count Presets ---
const COUNT_PRESETS = [1, 2, 3, 6, 10, 15, 30];

// --- Pipeline Stage Card (Compact for mobile) ---
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
      className={`flex items-center gap-2 sm:gap-3 rounded-md sm:rounded-lg border p-2 sm:p-2.5 transition-all ${statusColors[stage.status]}`}
    >
      <div className="shrink-0">
        {stage.status === "active" ? (
          <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
        ) : stage.status === "completed" ? (
          <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        ) : stage.status === "failed" ? (
          <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        ) : (
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] sm:text-[10px] font-mono font-medium truncate">{name}</p>
        {stage.status === "active" && (
          <Progress value={stage.progress} className="h-0.5 mt-0.5 sm:mt-1" />
        )}
      </div>
    </div>
  );
}

// --- Terminal Log (Collapsible, mobile-friendly) ---
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
    <div className="w-full mt-1.5 sm:mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-zinc-500 hover:text-zinc-300 active:text-zinc-200 transition-colors w-full px-1 py-1.5"
      >
        <TerminalSquare className="h-3 w-3" />
        <span>{language === "ru" ? "Лог" : "Log"}</span>
        <div className="h-px bg-zinc-800 flex-1" />
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {isOpen && (
        <div
          ref={scrollRef}
          className="w-full h-24 sm:h-32 overflow-y-auto rounded-md sm:rounded-lg border border-zinc-800 bg-black/80 p-2 sm:p-3 font-mono text-[9px] sm:text-[10px] text-zinc-500 scrollbar-thin scrollbar-thumb-zinc-800 mt-1.5 sm:mt-2"
        >
          {allLogs.map((log, i) => (
            <div key={i} className="leading-4 sm:leading-5 font-mono">
              <span className="text-zinc-600 mr-1.5 sm:mr-2">[{log.stageId.substring(0, 3)}]</span>
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
        </div>
      )}
    </div>
  );
}

// --- Video Count Selector (Enhanced with custom input) ---
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
  const [customValue, setCustomValue] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const isCustom = !COUNT_PRESETS.includes(count);

  const handleCustomSubmit = () => {
    const val = parseInt(customValue, 10);
    if (!isNaN(val) && val >= 1 && val <= 30) {
      onChange(val);
      setShowCustom(false);
      setCustomValue("");
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 sm:p-3">
      <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500 shrink-0" />
      <div className="flex-1 overflow-x-auto scrollbar-none">
        <p className="text-[9px] sm:text-[10px] font-mono text-zinc-400 mb-1 sm:mb-1.5 whitespace-nowrap">
          {language === "ru" ? "КОЛИЧЕСТВО ВИДЕО" : "VIDEO COUNT"}
        </p>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {COUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { onChange(preset); setShowCustom(false); }}
              disabled={disabled}
              className={cn(
                "h-6 sm:h-7 min-w-[22px] sm:min-w-[26px] rounded px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-mono transition-all border",
                count === preset && !isCustom
                  ? "bg-white text-black border-white shadow-sm"
                  : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-800 hover:text-zinc-300",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {preset}
            </button>
          ))}
          {/* Custom button */}
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              disabled={disabled}
              className={cn(
                "h-6 sm:h-7 px-1.5 sm:px-2 rounded text-[10px] sm:text-[11px] font-mono transition-all border",
                isCustom
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-transparent text-zinc-500 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {isCustom ? count : "..."}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="30"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                placeholder="1-30"
                className="h-6 sm:h-7 w-12 sm:w-14 px-1.5 sm:px-2 rounded text-[10px] sm:text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-violet-500"
                autoFocus
              />
              <button
                onClick={handleCustomSubmit}
                className="h-6 sm:h-7 px-1.5 sm:px-2 rounded bg-violet-600 text-white text-[9px] sm:text-[10px] font-mono hover:bg-violet-500"
              >
                OK
              </button>
              <button
                onClick={() => { setShowCustom(false); setCustomValue(""); }}
                className="h-6 sm:h-7 px-1 sm:px-1.5 rounded text-zinc-500 hover:text-zinc-300 text-[10px] sm:text-[11px]"
              >
                ✕
              </button>
            </div>
          )}
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

  const [rightTab, setRightTab] = useState<"pipeline" | "gallery" | "preview">("pipeline");
  const [mobileTab, setMobileTab] = useState<"chat" | "results">("chat");

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ niche: "", goal: "" });

  const isIdle = status === "idle";
  const isRunning = status !== "idle" && status !== "completed" && status !== "failed";
  const isFailed = status === "failed";
  const isDone = status === "completed";

  const totalProgress = Math.round(
    stages.reduce((acc, s) => acc + s.progress, 0) / stages.length
  );

  useEffect(() => {
    async function checkProfile() {
      try {
        const { data: profile } = await fetchProfile().catch(() => ({ data: null }));
        if (profile && (!profile.niche || !profile.goal)) {
          setShowOnboarding(true);
        }
      } catch (e) { console.warn(e); }
    }
    checkProfile();
  }, []);

  const handleOnboardingSubmit = async () => {
    if (!onboardingData.niche.trim() || !onboardingData.goal.trim()) return;
    try {
      await updateProfile({ niche: onboardingData.niche, goal: onboardingData.goal });
      setShowOnboarding(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (status === "brainstorming" || status === "generating_scenarios") {
      setRightTab("pipeline");
      // Auto-switch to results on mobile when running
      if (window.innerWidth < 1024) setMobileTab("results");
    }
  }, [status]);

  const runPipeline = useCallback(
    async (strategy: StrategyOption) => {
      if (isRunning) return;

      store.selectStrategy(strategy);
      store.startPipeline();
      setRightTab("pipeline");
      if (window.innerWidth < 1024) setMobileTab("results");

      try {
        store.advanceStage("brainstorming");
        store.addLog("brainstorming", `Strategy selected: ${strategy.title}`);
        await new Promise((r) => setTimeout(r, 800));
        store.completeStage("brainstorming");

        store.advanceStage("generating_scenarios");
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
              niche: profile.niche,
              goal: profile.goal
            } : undefined
          }),
        });

        if (!scenarioRes.ok) throw new Error("Scenario generation failed");
        const scenarioData = await scenarioRes.json();

        const generatedScenarios: Scenario[] = scenarioData.data.scenarios;
        store.setScenarios(generatedScenarios);
        store.completeStage("generating_scenarios");

        store.advanceStage("fetching_assets");
        const STYLE_SUFFIX = " cinematic, 4k, hyper-realistic, dark mode, high quality";

        const allQueries = generatedScenarios.flatMap((s) =>
          (s.asset_queries?.length > 0 ? s.asset_queries.slice(0, 2) : [s.hook]).map(q => q + STYLE_SUFFIX)
        );

        const BATCH_SIZE = 15;
        let allGrouped: any[] = [];
        let allFlatAssets: string[] = [];

        for (let i = 0; i < allQueries.length; i += BATCH_SIZE) {
          const batch = allQueries.slice(i, i + BATCH_SIZE);
          const ingestRes = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ queries: batch, clips_per_query: 3 }),
          });
          const ingestData = await ingestRes.json();
          if (ingestData.grouped) allGrouped.push(...ingestData.grouped);
          if (ingestData.assets) allFlatAssets.push(...ingestData.assets);

          store.updateStageProgress("fetching_assets", Math.round(((i + batch.length) / allQueries.length) * 100));
        }

        store.completeStage("fetching_assets");

        store.advanceStage("composing");
        // Get user plan for watermark logic
        const userPlan = (profile?.plan as "free" | "creator" | "pro" | "agency") || "free";

        generatedScenarios.forEach((scenario, idx) => {
          const queryStartIdx = idx * 2;
          const scenarioClips = []; // Simplified matching logic for brevity here
          // Re-use logic from previous version for brevity
          for (let q = queryStartIdx; q < queryStartIdx + 2 && q < allGrouped.length; q++) {
            scenarioClips.push(...(allGrouped[q]?.assets || []));
          }
          const finalClips = scenarioClips.length > 0 ? scenarioClips : allFlatAssets.slice(idx * 4, idx * 4 + 4);
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
          // Pass userPlan to buildComposition for watermark control
          const comp = buildComposition(scenario, clipObjects, montageStyle, 30, userPlan);
          store.addComposition(comp);
          store.updateStageProgress("composing", Math.round(((idx + 1) / generatedScenarios.length) * 100));
        });

        store.completeStage("composing");
        store.completePipeline();

      } catch (err: any) {
        console.error(err);
        const activeStage = stages.find((s) => s.status === "active");
        if (activeStage) store.failStage(activeStage.id, err.message);
        store.failPipeline(err.message);
      }
    },
    [store, language, stages, montageStyle, videoCount, isRunning]
  );

  const handleStrategySelect = useCallback((s: StrategyOption) => runPipeline(s), [runPipeline]);

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100vh-64px)] gap-3 p-1 md:p-0 lg:p-0 overflow-hidden">
      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white w-[95%] rounded-xl">
          <DialogHeader>
            <DialogTitle>Welcome</DialogTitle>
            <DialogDescription className="text-zinc-500">Tell us about your project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="niche" className="text-sm text-zinc-400">Your Niche</label>
              <Input id="niche" placeholder="Example: Crypto, Yoga..." className="bg-zinc-900 border-zinc-800"
                value={onboardingData.niche}
                onChange={(e) => setOnboardingData({ ...onboardingData, niche: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label htmlFor="goal" className="text-sm text-zinc-400">Main Goal</label>
              <Input id="goal" placeholder="Example: Get Leads..." className="bg-zinc-900 border-zinc-800"
                value={onboardingData.goal}
                onChange={(e) => setOnboardingData({ ...onboardingData, goal: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOnboardingSubmit} className="bg-white text-black w-full">Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Header & Tabs */}
      <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
              {language === "ru" ? "Генератор" : "Generator"}
              <span className="lg:hidden text-[8px] sm:text-[10px] bg-violet-900/40 text-violet-300 px-1 sm:px-1.5 py-0.5 rounded border border-violet-500/20">Beta</span>
            </h1>
          </div>
          <div className="flex gap-2">
            {!isIdle && (
              <Button variant="ghost" size="sm" onClick={() => store.reset()} className="h-7 w-7 sm:h-8 sm:w-8 p-0 lg:w-auto lg:px-3 text-zinc-500 hover:text-white">
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:mr-1.5" />
                <span className="hidden lg:inline">{language === "ru" ? "Сброс" : "Reset"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* MOBILE TAB SWITCHER */}
        <div className="lg:hidden grid grid-cols-2 gap-1 bg-zinc-900/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-zinc-800/50">
          <button
            onClick={() => setMobileTab("chat")}
            className={cn(
              "flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all",
              mobileTab === "chat" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {language === "ru" ? "Чат" : "Chat"}
          </button>
          <button
            onClick={() => setMobileTab("results")}
            className={cn(
              "flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all relative",
              mobileTab === "results" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <LayoutTemplate className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {language === "ru" ? "Результаты" : "Results"}
            {isRunning && <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Main Content Area - Two Column on Desktop */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">

        {/* LEFT: Chat Panel */}
        <div className={cn(
          "flex flex-col gap-3 min-h-0 transition-all",
          // Mobile: Show/hide based on tab
          mobileTab === "chat" ? "flex-1" : "hidden",
          // Desktop: Always visible, fixed width
          "lg:flex lg:w-[420px] lg:shrink-0"
        )}>
          {(isIdle || isFailed) && (
            <VideoCountSelector count={videoCount} onChange={store.setVideoCount} language={language} disabled={isRunning} />
          )}
          <ViralChat
            onStrategySelect={handleStrategySelect}
            className="flex-1 min-h-0 border-0 lg:border bg-zinc-950/50 lg:rounded-xl"
          />
        </div>

        {/* RIGHT: Results Panel */}
        <div className={cn(
          "flex flex-col rounded-xl border border-zinc-800 bg-black/40 backdrop-blur-sm min-h-0 transition-all",
          // Mobile: Show/hide based on tab
          mobileTab === "results" ? "flex-1" : "hidden",
          // Desktop: Always visible, takes remaining space
          "lg:flex lg:flex-1"
        )}>
          {/* Tab Bar within Results Panel - Mobile optimized */}
          {!isIdle && (
            <div className="flex border-b border-zinc-800 bg-zinc-900/30 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: "pipeline" as const, label: language === "ru" ? "Процесс" : "Pipeline", icon: Zap },
                { id: "gallery" as const, label: language === "ru" ? "Сценарии" : "Scenarios", icon: Layers, count: scenarios.length },
                { id: "preview" as const, label: language === "ru" ? "Превью" : "Preview", icon: Film, count: compositions.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs transition-all border-b-2 whitespace-nowrap min-w-[70px] sm:min-w-[90px] justify-center",
                    rightTab === tab.id ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <tab.icon className="h-3 w-3" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-0.5 sm:ml-1 text-[8px] sm:text-[9px] bg-zinc-800 px-1 sm:px-1.5 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 lg:p-4 scrollbar-thin scrollbar-thumb-zinc-800 pb-16 sm:pb-20 lg:pb-4">
            <AnimatePresence mode="wait">
              {isIdle && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4 opacity-50">
                  <Layers className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-700" />
                  <p className="text-[10px] sm:text-xs text-zinc-600">
                    {language === "ru" ? "Результаты появятся здесь" : "Results will appear here"}
                  </p>
                </div>
              )}
              {!isIdle && rightTab === "pipeline" && (
                <div className="flex flex-col gap-2 sm:gap-3">
                  {selectedStrategy && (
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 truncate max-w-[60%]">{selectedStrategy.title}</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{totalProgress}%</span>
                    </div>
                  )}
                  <Progress value={totalProgress} className="h-1 sm:h-1.5" />
                  <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                    {stages.map(s => <StageCard key={s.id} stage={s} language={language} />)}
                  </div>
                  <TerminalLog stages={stages} language={language} />
                </div>
              )}
              {!isIdle && rightTab === "gallery" && (
                <ScenarioGallery
                  scenarios={scenarios}
                  compositions={compositions}
                  selectedIds={selectedScenarioIds}
                  onToggle={store.toggleScenarioSelection}
                  onSelectAll={store.selectAllScenarios}
                  onDeselectAll={store.deselectAllScenarios}
                  onPreview={(idx) => { store.setActiveCompositionIndex(idx); setRightTab("preview"); }}
                  language={language}
                />
              )}
              {!isIdle && rightTab === "preview" && (
                <VideoCarousel
                  compositions={compositions}
                  activeIndex={activeCompositionIndex}
                  onChangeIndex={store.setActiveCompositionIndex}
                  language={language}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
