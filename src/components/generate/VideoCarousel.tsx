"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Film } from "lucide-react";
import { Player } from "@remotion/player";
import { ViralMontage } from "@/remotion/components/ViralMontage";
import { Button } from "@/components/ui/button";
import type { MontageComposition } from "@/types";

interface VideoCarouselProps {
  compositions: MontageComposition[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  language: "en" | "ru";
}

export function VideoCarousel({
  compositions,
  activeIndex,
  onChangeIndex,
  language,
}: VideoCarouselProps) {
  if (compositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Film className="h-10 w-10 text-zinc-700" />
        <p className="text-xs font-mono text-zinc-600">
          {language === "ru" ? "Нет готовых композиций" : "No compositions ready"}
        </p>
      </div>
    );
  }

  const active = compositions[Math.min(activeIndex, compositions.length - 1)];
  if (!active) return null;

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < compositions.length - 1;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Video Player */}
      <div className="relative w-full max-w-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-2xl ring-1 ring-white/5"
          >
            <Player
              component={ViralMontage}
              inputProps={{
                assets: active.clips.map((c) => c.url),
                strategy: {
                  hook_text: active.scenario.hook,
                  title: active.scenario.title,
                  description: active.scenario.body,
                },
                subtitles: active.subtitles,
                montageStyle: active.style,
              }}
              durationInFrames={active.duration_frames}
              fps={active.fps}
              compositionWidth={active.width}
              compositionHeight={active.height}
              style={{ width: "100%", height: "100%" }}
              controls
              autoPlay
              loop
            />

            {/* Badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2 py-1 bg-black/60 backdrop-blur text-[9px] font-mono text-green-400 rounded border border-green-500/20">
                {activeIndex + 1}/{compositions.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {canPrev && (
          <button
            onClick={() => onChangeIndex(activeIndex - 1)}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-300" />
          </button>
        )}
        {canNext && (
          <button
            onClick={() => onChangeIndex(activeIndex + 1)}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 transition-colors z-20"
          >
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </button>
        )}
      </div>

      {/* Scenario Info */}
      <div className="text-center max-w-[300px]">
        <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
          {active.scenario.title}
        </p>
        <p className="text-[10px] font-mono text-zinc-500 mt-0.5 line-clamp-1">
          {active.clips.length} {language === "ru" ? "клипов" : "clips"} ·{" "}
          {active.scenario.duration_seconds}s ·{" "}
          {active.subtitles.length} {language === "ru" ? "субтитров" : "subtitles"}
        </p>
      </div>

      {/* Thumbnail Strip */}
      {compositions.length > 1 && (
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[340px]">
          {compositions.map((comp, i) => (
            <button
              key={comp.id}
              onClick={() => onChangeIndex(i)}
              className={`
                px-2.5 py-1 text-[10px] font-mono rounded-md border transition-all
                ${i === activeIndex
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
                }
              `}
              title={comp.scenario.title}
            >
              #{i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
