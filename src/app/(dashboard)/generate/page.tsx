"use client";

import React, { useState } from "react";
import { ViralChat, StrategyOption } from "@/components/chat/ViralChat";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Player } from "@remotion/player";
import { ViralMontage } from "@/remotion/components/ViralMontage";
import { Progress } from "@/components/ui/progress";

export default function GeneratePage() {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyOption | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoAssets, setVideoAssets] = useState<string[]>([]);

  const handleStrategySelect = (strategy: StrategyOption) => {
    setSelectedStrategy(strategy);
    handleGenerate(strategy);
  };

  const handleGenerate = async (strategy: StrategyOption) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setVideoAssets([]);

    // Simulation of the "Ghost Protocol" pipeline
    const stages = ["analyzing_hook", "fetching_assets", "ffmpeg_processing", "finalizing"];

    try {
      for (const stage of stages) {
        await new Promise(r => setTimeout(r, 1000)); // Simulate work

        if (stage === "fetching_assets") {
          // Actual API Call to Ingest
          try {
            const res = await fetch("/api/ingest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: strategy.hook_text }) // Use hook as query
            });
            const data = await res.json();

            if (data.success && (data.assets || data.url)) {
              // Support both old (single url) and new (assets array) formats
              const newAssets = data.assets || [data.url];
              setVideoAssets(newAssets);
            } else {
              throw new Error("Asset fetch failed");
            }
          } catch (e) {
            console.error("Ingest failed", e);
            // Fallback for demo if API fails
            setVideoAssets([
              "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-vertical-4565/1080p.mp4",
              "https://cdn.coverr.co/videos/coverr-neon-signs-in-tokyo-night-4546/1080p.mp4"
            ]);
          }
        }

        setGenerationProgress(prev => prev + 25);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Viral Dashboard</h1>
          <p className="text-muted-foreground">Brainstorm with AI, select a strategy, and generate content.</p>
        </div>
      </div>

      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Chat Interface */}
        <div className="flex flex-col gap-4">
          <ViralChat onStrategySelect={handleStrategySelect} />
        </div>

        {/* Right Column: Preview/Result */}
        <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border border-border bg-card/50 p-8 min-h-[700px]">
          {!selectedStrategy ? (
            <div className="text-center text-muted-foreground">
              <div className="mb-4 flex justify-center">
                <div className="h-20 w-20 rounded-2xl bg-muted/20 animate-pulse" />
              </div>
              <p>Select a strategy to start generating</p>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-6 flex flex-col items-center">
              {/* Progress / Status Header */}
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">
                    {generationProgress < 100 ? "Synthesizing Content..." : "Production Complete"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    STRATEGY: {selectedStrategy?.title}
                  </p>
                </div>
                {generationProgress < 100 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>

              {/* Progress Bar */}
              <Progress value={generationProgress} className="h-2 w-full" />

              {/* Log Output Simulation */}
              <div className="w-full h-32 overflow-hidden rounded-md border border-border bg-black/50 p-3 font-mono text-xs text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <span className="text-green-500">$ init ghost_protocol --v4</span>
                  {generationProgress > 10 && <span>&gt; analyzing hook: &quot;{selectedStrategy?.hook_text}&quot;</span>}
                  {generationProgress > 30 && <span>&gt; searching vector_db [Pexels/Coverr]...</span>}
                  {videoAssets.length > 0 && <span className="text-blue-400">&gt; assets acquired: {videoAssets.length} clips</span>}
                  {generationProgress > 75 && <span>&gt; sequencing montage [cuts, transitions]...</span>}
                  {generationProgress === 100 && <span className="text-green-400">&gt; render complete. output ready.</span>}
                </div>
              </div>

              {/* Final Video Result - REMOTION PLAYER */}
              {videoAssets.length > 0 && generationProgress === 100 && (
                <div className="relative aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl ring-1 ring-white/10">
                  <Player
                    component={ViralMontage}
                    inputProps={{
                      assets: videoAssets,
                      strategy: selectedStrategy
                    }}
                    durationInFrames={450} // 15 seconds
                    fps={30}
                    compositionWidth={1080}
                    compositionHeight={1920}
                    style={{ width: '100%', height: '100%' }}
                    controls
                    autoPlay
                    loop
                  />
                  <div className="absolute top-4 right-4 z-10 pointers-events-none">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-mono text-green-400 rounded border border-green-500/20">
                      LIVE_PREVIEW
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
