"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Loader2, Film, Zap, Clapperboard, Play } from "lucide-react";
// ... imports

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { VideoStyle, GenerationProgress } from "@/types";

const styles: { id: VideoStyle; label: string; icon: React.ElementType }[] = [
  { id: "cinematic", label: "Cinematic", icon: Film },
  { id: "dynamic", label: "Dynamic", icon: Zap },
  { id: "minimal", label: "Minimal", icon: Clapperboard },
];

const languages = [
  { code: "en", label: "English" },
  { code: "ru", label: "Russian" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
];

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
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<VideoStyle>("cinematic");
  const [language, setLanguage] = useState("en");
  const [videoCount, setVideoCount] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setIsGenerating(true);

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

      // Simulate API call time
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
    setTopic("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Videos</h1>
        <p className="mt-1 text-muted-foreground">
          Enter a topic and get 30 unique viral videos
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isGenerating ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Topic input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic / Niche</label>
              <Input
                placeholder='e.g. "Productivity tips for remote workers"'
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-14 text-lg"
              />
            </div>

            {/* Settings */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Video count */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  VIDEOS
                </label>
                <select
                  value={videoCount}
                  onChange={(e) => setVideoCount(Number(e.target.value))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm font-mono h-11 w-full sm:w-auto"
                >
                  <option value={1}>1</option>
                  <option value={30}>30</option>
                </select>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  STYLE
                </label>
                <div className="flex gap-2">
                  {styles.map((s) => (
                    <Button
                      key={s.id}
                      variant={style === s.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyle(s.id)}
                      className="gap-1.5"
                    >
                      <s.icon className="h-3.5 w-3.5" />
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  LANGUAGE
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm h-11 w-full sm:w-auto"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate button */}
            <Button
              size="lg"
              className="w-full gap-2 text-base"
              onClick={handleGenerate}
              disabled={!topic.trim()}
            >
              <Sparkles className="h-5 w-5" />
              Generate {videoCount} Video{videoCount > 1 ? "s" : ""}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current topic */}
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Generating for:</p>
              <p className="mt-1 text-lg font-medium">&ldquo;{topic}&rdquo;</p>
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
                      <DialogContent className="border-none bg-black p-0 sm:max-w-sm">
                        <DialogTitle className="sr-only">Video Player</DialogTitle>
                        <DialogDescription className="sr-only">Preview of the viral video</DialogDescription>
                        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-black">
                          <video
                            src="https://videos.pexels.com/video-files/5532766/5532766-hd_1080_1920_30fps.mp4"
                            controls
                            autoPlay
                            playsInline
                            loop
                            muted
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                  {videoCount > 15 && (
                    <div className="flex aspect-[9/16] items-center justify-center rounded-lg border border-dashed border-border">
                      <span className="text-xs text-muted-foreground">+{videoCount - 15} more</span>
                    </div>
                  )}
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full">
                  Generate Another Batch
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
