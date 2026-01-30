"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Loader2, Film, Zap, Clapperboard, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { VideoStyle, GenerationProgress } from "@/types";
import { ViralChat, StrategyOption } from "@/components/chat/ViralChat";

const stages: Record<string, string> = {
  pending: "Preparing...",
  parsing: "Parsing topic into angles...",
  generating_scenarios: "AI generating 30 scenarios...",
  fetching_assets: "Finding stock footage...",
  rendering: "Rendering videos...",
  completed: "Generation complete!",
  failed: "Generation failed.",
};

export default function GeneratePage() {
  const [videoCount, setVideoCount] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [currentStrategy, setCurrentStrategy] = useState<StrategyOption | null>(null);

  async function handleStrategySelect(strategy: StrategyOption) {
    setCurrentStrategy(strategy);
    handleGenerate(strategy);
  }

  async function handleGenerate(strategy: StrategyOption) {
    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    // Simulate pipeline stages
    const stageList: GenerationProgress["stage"][] = [
      "parsing",
      "generating_scenarios",
      "fetching_assets",
      "rendering",
      "completed",
    ];

    for (let i = 0; i < stageList.length; i++) {
      const stage = stageList[i];
      const baseProgress = (i / stageList.length) * 100;

      setProgress({
        project_id: "demo",
        stage,
        progress: Math.min(baseProgress + 20, 100),
        current_step: stages[stage],
        scenarios_generated: stage === "generating_scenarios" || i > 1 ? videoCount : 0,
        videos_rendered: stage === "completed" ? videoCount : stage === "rendering" ? Math.floor(videoCount / 2) : 0,
        total_videos: videoCount,
      });

      // Execute Real Asset Discovery
      if (stage === "fetching_assets") {
        try {
          const response = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Use the hook text as the primary search query for stock footage
            body: JSON.stringify({ query: strategy.hook_text })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              console.log("Secure asset acquired:", data.url);
              setGeneratedVideoUrl(data.url);
            }
          }
        } catch (e) {
          console.error("Asset discovery failed, using fallback", e);
        }
      }

      // Simulate Processing Time
      if (stage !== "completed") {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setProgress((prev) =>
      prev ? { ...prev, progress: 100, stage: "completed" } : null
    );
  }

  function handleReset() {
    setIsGenerating(false);
    setProgress(null);
    setCurrentStrategy(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Viral Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Brainstorm with AI, select a strategy, and generate content.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isGenerating ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ViralChat onStrategySelect={handleStrategySelect} />
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Strategy Info */}
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Executing Strategy:</p>
                  <p className="mt-1 text-xl font-bold tracking-tight">{currentStrategy?.title}</p>
                  <p className="font-mono text-sm text-primary mt-2">
                    &quot;{currentStrategy?.hook_text}&quot;
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={progress?.stage !== "completed"}>
                  {progress?.stage === "completed" ? "New Project" : "Cancel"}
                </Button>
              </div>
            </Card>

            {/* Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress?.stage !== "completed" && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {progress?.current_step || "Starting..."}
                  </span>
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {Math.round(progress?.progress || 0)}%
                </span>
              </div>
              <Progress value={progress?.progress || 0} className="h-2" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Scenarios: {progress?.scenarios_generated || 0}/{videoCount}
                </span>
                <span>
                  Videos: {progress?.videos_rendered || 0}/{videoCount}
                </span>
              </div>
            </div>

            {/* Result grid (when complete) */}
            {progress?.stage === "completed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">
                  {videoCount} Video{videoCount > 1 ? "s" : ""} Generated
                </h3>
                <div className={cn(
                  "grid gap-3",
                  videoCount === 1
                    ? "flex justify-center"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                )}>
                  {Array.from({ length: Math.min(videoCount, 15) }).map((_, i) => (
                    <Dialog key={i}>
                      <DialogTrigger asChild>
                        <div className={cn(
                          "group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-black transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
                          videoCount === 1 ? "aspect-[9/16] w-full max-w-[240px]" : "aspect-[9/16]"
                        )}>
                          {/* Thumbnail / Placeholder */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                              <Play className="h-6 w-6 fill-primary text-primary" />
                            </div>
                          </div>

                          {/* Text Overlay */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="truncate text-[10px] font-medium text-muted-foreground">
                              {videoCount === 1 ? "Viral_Masterpiece.mp4" : `Viral_Clip_${i + 1}.mp4`}
                            </p>
                          </div>

                          {/* Fake Preview Image (Gradient) */}
                          <div className="h-full w-full bg-neutral-900 object-cover opacity-50" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0">
                        <DialogTitle className="sr-only">Viral Video Preview</DialogTitle>
                        <DialogDescription className="sr-only">Preview of the viral video</DialogDescription>
                        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-black">
                          <video
                            src={generatedVideoUrl || "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-vertical-4565/1080p.mp4"}
                            controls
                            autoPlay
                            playsInline
                            loop
                            muted
                            // @ts-ignore
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
