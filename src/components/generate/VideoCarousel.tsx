"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Image,
  Download,
  Video,
  Loader2,
} from "lucide-react";
import { Player, PlayerRef } from "@remotion/player";
import { ViralMontage } from "@/remotion/components/ViralMontage";
import { Thumbnail } from "@/remotion/components/Thumbnail";
import { Button } from "@/components/ui/button";
import { capturePlayerPlayback, downloadBlob, type RenderProgress } from "@/lib/client-render";
import type { MontageComposition } from "@/types";

interface VideoCarouselProps {
  compositions: MontageComposition[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  language: "en" | "ru";
}

type ViewMode = "video" | "cover";
type CoverStyle = "bold" | "minimal" | "neon";

// Memoized player component for performance
const VideoPlayer = memo(function VideoPlayer({
  active,
  playerRef,
}: {
  active: MontageComposition;
  playerRef: React.RefObject<PlayerRef>;
}) {
  return (
    <Player
      ref={playerRef}
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
  );
});

export function VideoCarousel({
  compositions,
  activeIndex,
  onChangeIndex,
  language,
}: VideoCarouselProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [coverStyle, setCoverStyle] = useState<CoverStyle>("bold");
  const [isDownloading, setIsDownloading] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const playerRef = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Empty state
  if (compositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 sm:py-12">
        <Film className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-700" />
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
  const firstClipUrl = active.clips[0]?.url;

  // Download cover as PNG
  const handleDownloadCover = useCallback(async () => {
    if (!containerRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = active.width;
      canvas.height = active.height;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(0.5, "#16213e");
      gradient.addColorStop(1, "#0f3460");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Overlay
      const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
      overlay.addColorStop(0, "rgba(0,0,0,0.1)");
      overlay.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Play button
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 80;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(centerX - 15, centerY - 25);
      ctx.lineTo(centerX - 15, centerY + 25);
      ctx.lineTo(centerX + 25, centerY);
      ctx.closePath();
      ctx.fillStyle = "#000000";
      ctx.fill();

      // Hook text
      const hookText = active.scenario.hook.toUpperCase();
      ctx.font = "bold 72px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 20;
      ctx.lineJoin = "round";

      const maxWidth = canvas.width * 0.85;
      const words = hookText.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = 80;
      const textY = canvas.height / 2 + 60;

      lines.forEach((line, i) => {
        const y = textY + i * lineHeight - ((lines.length - 1) * lineHeight) / 2;
        ctx.strokeText(line, centerX, y);
      });
      ctx.fillStyle = "#FFFFFF";
      lines.forEach((line, i) => {
        const y = textY + i * lineHeight - ((lines.length - 1) * lineHeight) / 2;
        ctx.fillText(line, centerX, y);
      });

      // Branding
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.textAlign = "right";
      ctx.fillText("TRENDSYNTHESIS", canvas.width - 24, canvas.height - 24);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${active.scenario.title.replace(/[^a-z0-9]/gi, "_")}_cover.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download cover:", error);
      alert(language === "ru" ? "Ошибка при скачивании" : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  }, [active, language]);

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-zinc-900 rounded-lg border border-zinc-800">
        <button
          onClick={() => setViewMode("video")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
            viewMode === "video" ? "bg-white text-black" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden xs:inline">{language === "ru" ? "Видео" : "Video"}</span>
        </button>
        <button
          onClick={() => setViewMode("cover")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
            viewMode === "cover" ? "bg-white text-black" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Image className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden xs:inline">{language === "ru" ? "Обложка" : "Cover"}</span>
        </button>
      </div>

      {/* Cover Style Selector */}
      {viewMode === "cover" && (
        <div className="flex items-center gap-1">
          {(["bold", "minimal", "neon"] as CoverStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setCoverStyle(style)}
              className={`px-2 py-1 text-[10px] font-mono rounded-md border transition-all capitalize ${
                coverStyle === style
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      )}

      {/* Player Container - Mobile optimized */}
      <div className="relative w-full max-w-[250px] sm:max-w-[300px]" ref={containerRef}>
        <AnimatePresence mode="wait">
          <div
            key={`${active.id}-${viewMode}`}
            className="relative aspect-[9/16] w-full overflow-hidden rounded-lg sm:rounded-xl border border-zinc-800 bg-black shadow-2xl"
            data-player-container
          >
            {viewMode === "video" ? (
              <VideoPlayer active={active} playerRef={playerRef} />
            ) : (
              <Player
                ref={playerRef}
                component={Thumbnail}
                inputProps={{
                  backgroundUrl: firstClipUrl,
                  hookText: active.scenario.hook,
                  title: active.scenario.title,
                  showPlayButton: true,
                  style: coverStyle,
                }}
                durationInFrames={1}
                fps={1}
                compositionWidth={active.width}
                compositionHeight={active.height}
                style={{ width: "100%", height: "100%" }}
                controls={false}
              />
            )}

            {/* Badge */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/60 backdrop-blur text-[8px] sm:text-[9px] font-mono text-green-400 rounded border border-green-500/20">
                {viewMode === "cover"
                  ? (language === "ru" ? "ОБЛОЖКА" : "COVER")
                  : `${activeIndex + 1}/${compositions.length}`}
              </span>
            </div>
          </div>
        </AnimatePresence>

        {/* Navigation Arrows - Touch friendly */}
        {viewMode === "video" && (
          <>
            {canPrev && (
              <button
                onClick={() => onChangeIndex(activeIndex - 1)}
                className="absolute left-1 sm:left-[-16px] top-1/2 -translate-y-1/2 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all z-20"
              >
                <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4 text-zinc-300" />
              </button>
            )}
            {canNext && (
              <button
                onClick={() => onChangeIndex(activeIndex + 1)}
                className="absolute right-1 sm:right-[-16px] top-1/2 -translate-y-1/2 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all z-20"
              >
                <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4 text-zinc-300" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Scenario Info */}
      <div className="text-center max-w-[280px] sm:max-w-[300px] px-2">
        <p className="text-xs sm:text-sm font-semibold text-zinc-200 line-clamp-1">
          {active.scenario.title}
        </p>
        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
          {active.clips.length} {language === "ru" ? "клипов" : "clips"} · {active.scenario.duration_seconds}s
        </p>
      </div>

      {/* Actions - Mobile optimized */}
      <div className="flex items-center gap-2 flex-wrap justify-center px-2">
        {viewMode === "cover" ? (
          <Button
            size="sm"
            className="text-xs h-9 sm:h-10 bg-white text-black hover:bg-zinc-200 font-semibold"
            onClick={handleDownloadCover}
            disabled={isDownloading}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {isDownloading ? "..." : (language === "ru" ? "Скачать" : "Download")}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] sm:text-xs h-9 sm:h-10 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
              onClick={() => {
                const text = `TITLE: ${active.scenario.title}\n\nHOOK: ${active.scenario.hook}\n\nBODY: ${active.scenario.body}\n\nCTA: ${active.scenario.cta}`;
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `script-${active.scenario.id}.txt`;
                a.click();
              }}
            >
              {language === "ru" ? "Текст" : "Script"}
            </Button>
            <Button
              size="sm"
              className="text-[11px] sm:text-xs h-9 sm:h-10 bg-white text-black hover:bg-zinc-200 font-semibold"
              disabled={isDownloading}
              onClick={async () => {
                if (!playerRef.current || !containerRef.current) return;
                setIsDownloading(true);
                setRenderProgress({ stage: "preparing", progress: 0 });

                try {
                  const playerEl = containerRef.current.querySelector("[data-player-container]") as HTMLElement;
                  if (!playerEl) throw new Error("Player not found");

                  const result = await capturePlayerPlayback(
                    playerRef.current,
                    playerEl,
                    {
                      fps: active.fps,
                      durationFrames: active.duration_frames,
                      width: active.width,
                      height: active.height,
                      onProgress: setRenderProgress,
                    }
                  );

                  const filename = `${active.scenario.title.replace(/[^a-z0-9]/gi, "_")}.webm`;
                  downloadBlob(result.blob, filename);
                } catch (error) {
                  console.error("Render failed:", error);
                  alert(language === "ru" ? "Ошибка" : "Error");
                } finally {
                  setIsDownloading(false);
                  setRenderProgress(null);
                }
              }}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {renderProgress?.progress || 0}%
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {language === "ru" ? "Видео" : "Video"}
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip - Scrollable on mobile */}
      {viewMode === "video" && compositions.length > 1 && (
        <div className="flex gap-1 sm:gap-1.5 overflow-x-auto max-w-full px-2 pb-2 scrollbar-none">
          {compositions.map((comp, i) => (
            <button
              key={comp.id}
              onClick={() => onChangeIndex(i)}
              className={`shrink-0 px-2 sm:px-2.5 py-1 text-[10px] font-mono rounded-md border transition-all ${
                i === activeIndex
                  ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                  : "border-zinc-800 text-zinc-600 hover:border-zinc-600"
              }`}
            >
              #{i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
