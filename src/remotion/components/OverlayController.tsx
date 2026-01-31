// ============================================
// TRENDSYNTHESIS — Overlay Controller V2
// Animated subtitles, phases, clip counter
// ============================================

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import React from "react";
import type { SubtitleSegment } from "@/types";

// --- Types ---
export interface OverlayConfig {
  hook: string;
  points: string[];
  cta: string;
}

interface OverlayControllerProps {
  config: OverlayConfig;
  subtitles?: SubtitleSegment[];
  textPosition?: "center" | "bottom" | "top";
}

// --- Animated Subtitle Component ---
const AnimatedSubtitle: React.FC<{
  text: string;
  startFrame: number;
  endFrame: number;
  style?: "default" | "highlight" | "impact";
  position: "center" | "bottom" | "top";
}> = ({ text, startFrame, endFrame, style = "default", position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Visibility check
  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  // Entrance animation (spring pop-in)
  const entrance = spring({
    fps,
    frame: localFrame,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.6,
    },
  });

  // Exit animation (fade out in last 8 frames)
  const exitStart = duration - 8;
  const exitOpacity = interpolate(
    localFrame,
    [exitStart, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Y translation (slide up)
  const translateY = interpolate(entrance, [0, 1], [25, 0]);

  // Scale for impact style
  const scale = style === "impact"
    ? interpolate(entrance, [0, 1], [0.85, 1])
    : 1;

  // Glitch offset for impact style (first 6 frames)
  const glitchX = style === "impact"
    ? interpolate(localFrame, [0, 3, 6], [4, -3, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Style variants
  const styleClasses: Record<string, string> = {
    default: "bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg",
    highlight: "bg-black/60 backdrop-blur-md px-6 py-3 rounded-lg border-l-4 border-white/80",
    impact: "bg-black/70 backdrop-blur-lg px-8 py-4 rounded-xl border border-white/20",
  };

  const textClasses: Record<string, string> = {
    default: "text-lg font-medium text-white/95 leading-relaxed",
    highlight: "text-xl font-semibold text-white leading-snug",
    impact: "text-3xl font-black text-white tracking-tight leading-tight",
  };

  // Position mapping
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { position: "absolute", top: "15%", left: 0, right: 0, paddingLeft: 32, paddingRight: 32 },
    center: { position: "absolute", top: "50%", left: 0, right: 0, transform: `translateY(calc(-50% + ${translateY}px)) translateX(${glitchX}px) scale(${scale})`, paddingLeft: 32, paddingRight: 32 },
    bottom: { position: "absolute", bottom: "12%", left: 0, right: 0, paddingLeft: 32, paddingRight: 32 },
  };

  // For non-center, apply transforms differently
  const wrapperStyle: React.CSSProperties = position === "center"
    ? { ...positionStyles.center, opacity: exitOpacity }
    : {
        ...positionStyles[position],
        transform: `translateY(${translateY}px) translateX(${glitchX}px) scale(${scale})`,
        opacity: exitOpacity,
      };

  return (
    <div style={wrapperStyle} className="flex justify-center z-40">
      <div className={styleClasses[style] || styleClasses.default} style={{ boxShadow: style === "impact" ? "0 8px 32px rgba(0,0,0,0.5)" : undefined }}>
        <p className={`${textClasses[style] || textClasses.default} text-center font-mono`}>
          {text.toUpperCase()}
        </p>
      </div>
    </div>
  );
};

// --- Phase Indicator (small tag showing current phase) ---
const PhaseIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hookEnd = Math.floor(durationInFrames * 0.2);
  const bodyEnd = Math.floor(durationInFrames * 0.8);

  let phase = "HOOK";
  let color = "#f87171"; // red-400
  if (frame >= hookEnd && frame < bodyEnd) {
    phase = "CONTENT";
    color = "#60a5fa"; // blue-400
  } else if (frame >= bodyEnd) {
    phase = "CTA";
    color = "#4ade80"; // green-400
  }

  return (
    <div style={{ position: "absolute", top: 24, left: 24, zIndex: 50 }}>
      <span
        style={{
          padding: "4px 8px",
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: "0.2em",
          border: `1px solid ${color}40`,
          borderRadius: 4,
          color,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        {phase}
      </span>
    </div>
  );
};

// --- Main Overlay Controller ---
export const OverlayController: React.FC<OverlayControllerProps> = ({
  config,
  subtitles,
  textPosition = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // If we have V2 subtitles data, use it. Otherwise, fall back to legacy config
  const hasSubtitles = subtitles && subtitles.length > 0;

  // --- V2 Subtitle-driven mode ---
  if (hasSubtitles) {
    const activeSub = subtitles.find(
      (s) => frame >= s.startFrame && frame <= s.endFrame
    );

    return (
      <AbsoluteFill>
        <PhaseIndicator />
        {activeSub && (
          <AnimatedSubtitle
            key={activeSub.id}
            text={activeSub.text}
            startFrame={activeSub.startFrame}
            endFrame={activeSub.endFrame}
            style={activeSub.style}
            position={textPosition}
          />
        )}
      </AbsoluteFill>
    );
  }

  // --- V1 Legacy mode (backward compatible) ---
  const hookDuration = Math.floor(durationInFrames * 0.2);
  const bodyDuration = Math.floor(durationInFrames * 0.6);

  const isHookPhase = frame < hookDuration;
  const isBodyPhase = frame >= hookDuration && frame < hookDuration + bodyDuration;
  const isCtaPhase = frame >= hookDuration + bodyDuration;

  const pointDuration = Math.floor(bodyDuration / config.points.length);
  const currentPointIndex = Math.floor((frame - hookDuration) / pointDuration);
  const activePoint = config.points[Math.min(currentPointIndex, config.points.length - 1)];

  return (
    <AbsoluteFill>
      <PhaseIndicator />

      {/* PHASE 1: HOOK */}
      {isHookPhase && (
        <AnimatedSubtitle
          text={config.hook}
          startFrame={0}
          endFrame={hookDuration}
          style="impact"
          position="center"
        />
      )}

      {/* PHASE 2: BODY POINTS */}
      {isBodyPhase && activePoint && (
        <AnimatedSubtitle
          key={activePoint}
          text={activePoint}
          startFrame={hookDuration + currentPointIndex * pointDuration}
          endFrame={hookDuration + (currentPointIndex + 1) * pointDuration}
          style="highlight"
          position={textPosition}
        />
      )}

      {/* PHASE 3: CTA */}
      {isCtaPhase && (
        <AnimatedSubtitle
          text={config.cta}
          startFrame={hookDuration + bodyDuration}
          endFrame={durationInFrames}
          style="impact"
          position="center"
        />
      )}
    </AbsoluteFill>
  );
};
