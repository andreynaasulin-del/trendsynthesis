// ============================================
// TRENDSYNTHESIS — Viral Montage Engine V2
// Crossfade transitions, Ken Burns, dynamic clips
// ============================================

import { AbsoluteFill, Sequence, Video, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import React from "react";
import { OverlayController } from "./OverlayController";
import type { SubtitleSegment, MontageStyle, TransitionType } from "@/types";

// --- Props ---
export interface ViralMontageProps {
  assets: string[];
  strategy: {
    hook_text: string;
    title: string;
    description: string;
  };
  // V2: Optional enhanced data
  subtitles?: SubtitleSegment[];
  montageStyle?: MontageStyle;
}

// --- Default style fallback ---
const DEFAULT_STYLE: MontageStyle = {
  transition: "crossfade",
  kenBurns: true,
  overlayOpacity: 0.4,
  textPosition: "bottom",
  progressBar: true,
  watermark: true,
  colorGrade: "cyberpunk",
};

// --- Ken Burns Effect Component ---
const KenBurnsClip: React.FC<{
  src: string;
  clipIndex: number;
  clipDuration: number;
}> = ({ src, clipIndex, clipDuration }) => {
  const frame = useCurrentFrame();

  // Alternate between zoom-in and zoom-out for variety
  const isZoomIn = clipIndex % 2 === 0;
  const startScale = isZoomIn ? 1.0 : 1.15;
  const endScale = isZoomIn ? 1.15 : 1.0;

  // Slow pan directions based on clip index
  const panDirections = [
    { x: [0, -3], y: [0, -2] },   // pan left-up
    { x: [0, 3], y: [0, -1] },    // pan right-up
    { x: [-2, 2], y: [0, 0] },    // pan left-to-right
    { x: [0, -2], y: [1, -1] },   // drift left-down-to-up
  ];
  const pan = panDirections[clipIndex % panDirections.length];

  const scale = interpolate(frame, [0, clipDuration], [startScale, endScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  const translateX = interpolate(frame, [0, clipDuration], pan.x, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [0, clipDuration], pan.y, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      <Video
        src={src}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        }}
      />
    </div>
  );
};

// --- Transition Overlay Component ---
const TransitionOverlay: React.FC<{
  type: TransitionType;
  clipDuration: number;
  transitionFrames: number;
}> = ({ type, clipDuration, transitionFrames }) => {
  const frame = useCurrentFrame();

  if (type === "cut") return null;

  // Fade-in at start
  const fadeIn = interpolate(frame, [0, transitionFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade-out at end
  const fadeOut = interpolate(
    frame,
    [clipDuration - transitionFrames, clipDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (type === "dip-to-black") {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: Math.max(fadeIn, fadeOut),
        }}
      />
    );
  }

  if (type === "crossfade") {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: fadeOut * 0.8,
        }}
      />
    );
  }

  return null;
};

// --- Color Grade Filter ---
const ColorGradeFilter: React.FC<{
  grade: MontageStyle["colorGrade"];
}> = ({ grade }) => {
  if (grade === "none") return null;

  const overlays: Record<string, React.CSSProperties> = {
    cinematic: {
      background: "linear-gradient(to bottom, rgba(0,0,30,0.1), rgba(0,0,0,0.05))",
      mixBlendMode: "multiply" as const,
    },
    cold: {
      background: "linear-gradient(135deg, rgba(0,20,60,0.15), rgba(0,10,30,0.1))",
      mixBlendMode: "overlay" as const,
    },
    warm: {
      background: "linear-gradient(135deg, rgba(60,30,0,0.1), rgba(40,20,0,0.05))",
      mixBlendMode: "overlay" as const,
    },
    cyberpunk: {
      background: "linear-gradient(135deg, rgba(20,0,40,0.4), rgba(0,255,255,0.05))",
      mixBlendMode: "overlay" as const,
    },
  };

  const style = overlays[grade];
  if (!style) return null;

  return <AbsoluteFill style={style} />;
};

// --- Progress Bar Component ---
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/10 z-50">
      <div
        className="h-full bg-white/80"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 8px rgba(255,255,255,0.5)",
        }}
      />
    </div>
  );
};

// --- Main Montage Component ---
export const ViralMontage: React.FC<ViralMontageProps> = ({
  assets,
  strategy,
  subtitles,
  montageStyle,
}) => {
  const { durationInFrames } = useVideoConfig();
  const style = montageStyle || DEFAULT_STYLE;

  // Transition duration: 8 frames (~0.27s at 30fps)
  const TRANSITION_FRAMES = style.transition === "cut" ? 0 : 8;

  // Calculate clip distribution
  const clipCount = assets.length || 1;
  const CLIP_DURATION = Math.floor(durationInFrames / clipCount);

  // Fallback: no assets
  if (!assets || assets.length === 0) {
    return (
      <AbsoluteFill className="bg-black items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
            <span className="text-white/40 text-2xl">⚠</span>
          </div>
          <p className="font-mono text-sm text-white/40 tracking-wider">NO ASSETS LOADED</p>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill className="bg-black">
      {/* ===== LAYER 1: VIDEO CLIPS WITH TRANSITIONS ===== */}
      {assets.map((src, index) => (
        <Sequence
          key={`clip-${index}`}
          from={index * CLIP_DURATION}
          durationInFrames={CLIP_DURATION}
        >
          {/* Video Clip */}
          {style.kenBurns ? (
            <KenBurnsClip
              src={src}
              clipIndex={index}
              clipDuration={CLIP_DURATION}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-black">
              <Video
                src={src}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  transform: "scale(1.05)",
                }}
              />
            </div>
          )}

          {/* Transition Overlay */}
          {index > 0 && (
            <TransitionOverlay
              type={style.transition}
              clipDuration={CLIP_DURATION}
              transitionFrames={TRANSITION_FRAMES}
            />
          )}
        </Sequence>
      ))}

      {/* ===== LAYER 2: COLOR GRADE ===== */}
      <ColorGradeFilter grade={style.colorGrade} />

      {/* ===== LAYER 3: DARK OVERLAY FOR TEXT READABILITY ===== */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom,
            rgba(0,0,0,${style.overlayOpacity * 0.3}) 0%,
            rgba(0,0,0,${style.overlayOpacity * 0.1}) 30%,
            rgba(0,0,0,${style.overlayOpacity * 0.1}) 60%,
            rgba(0,0,0,${style.overlayOpacity * 0.7}) 100%)`,
        }}
      />

      {/* ===== LAYER 4: SUBTITLES & TEXT OVERLAY ===== */}
      <OverlayController
        config={{
          hook: strategy.hook_text,
          points: [
            strategy.title.toUpperCase(),
            "TRENDING NOW",
            "WATCH TILL END",
          ],
          cta: "LINK IN BIO",
        }}
        subtitles={subtitles}
        textPosition={style.textPosition}
      />

      {/* ===== LAYER 5: PROGRESS BAR ===== */}
      {style.progressBar && <ProgressBar />}

      {/* ===== LAYER 6: WATERMARK ===== */}
      {style.watermark && (
        <div className="absolute top-6 right-6 z-50">
          <p className="text-[9px] font-mono text-white/20 tracking-[0.3em]">
            TRENDSYNTHESIS
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
