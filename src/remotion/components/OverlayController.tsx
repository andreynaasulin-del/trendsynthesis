// ============================================
// TRENDSYNTHESIS — Overlay Controller V4
// Kinetic Typography with word-by-word POP effects
// High-impact viral video captions
// ============================================

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import React, { useMemo } from "react";
import type { SubtitleSegment } from "@/types";
import {
  KineticTypography,
  subtitlesToWordTimings,
  textToWordTimings,
  type WordTiming,
} from "./KineticTypography";

import { styles } from "../styles";

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
  /** Use new Kinetic Typography mode (default: true) */
  useKinetic?: boolean;
}

// --- TikTok Style Constants ---
const HIGHLIGHT_COLOR = "#00D4FF"; // Electric Cyan for ACTIVE word (modern, TikTok-style)
const TRIGGER_COLOR = "#FF6B35";   // Vibrant Orange for TRIGGER words
const TRIGGER_WORDS = ["MONEY", "AI", "SECRET", "CRYPTO", "VIRAL", "WEALTH", "SYSTEM", "FREE", "GOD", "MODE", "CASH", "DOLLAR"];

// ============================================
// TIKTOK-STYLE ANIMATED WORD (Legacy - kept for fallback)
// ============================================
const TikTokSubtitle: React.FC<{
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
  const durationMs = (duration / fps) * 1000;
  const localTimeMs = (localFrame / fps) * 1000;

  // Split text into words for highlighting
  const words = useMemo(() => {
    const wordList = text.split(" ").filter(Boolean);
    const wordDuration = durationMs / wordList.length;
    return wordList.map((word, idx) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const isTrigger = TRIGGER_WORDS.some(t => cleanWord.includes(t));
      return {
        text: word,
        startMs: idx * wordDuration,
        endMs: (idx + 1) * wordDuration,
        isTrigger
      };
    });
  }, [text, durationMs]);

  // Spring entrance animation
  const entrance = spring({
    fps,
    frame: localFrame,
    config: {
      damping: 200, // Match template-tiktok damping
      stiffness: 300,
    },
    durationInFrames: 5,
  });

  // Exit fade
  const exitStart = duration - 8;
  const exitOpacity = interpolate(
    localFrame,
    [exitStart, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scale and Y translation
  const scaleValue = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [50, 0]);

  // Position styles - adjusted for safe text display
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: "8%", bottom: undefined },
    center: { top: "45%", transform: `translateY(-50%)` },
    bottom: { bottom: "15%", top: undefined }, // Raised slightly for better visibility
  };

  // Style variants - reduced font sizes for better fit
  const fontSizes: Record<string, number> = {
    default: 48,
    highlight: 56,
    impact: 64,
  };

  const fontSize = fontSizes[style] || fontSizes.default;

  return (
    <AbsoluteFill
      style={{
        ...positionStyles[position],
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: position === "bottom" ? 40 : 0,
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scaleValue}) translateY(${translateY}px)`,
          textAlign: "center",
          maxWidth: "90%",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {/* Stroke layer (behind) */}
        <p
          style={{
            position: "absolute",
            fontSize,
            fontWeight: 900,
            fontFamily: styles.fonts.heading, // Use Montserrat Black
            textTransform: "uppercase",
            color: "transparent",
            WebkitTextStroke: "8px black", // Thicker stroke for "Vibe" look
            paintOrder: "stroke",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "0.02em",
            wordBreak: "break-word",
            zIndex: 0,
          }}
        >
          {words.map((word, idx) => (
            <span key={idx} style={{ whiteSpace: "pre-wrap", display: "inline-block" }}>
              {word.text}{" "}
            </span>
          ))}
        </p>

        {/* Main text with word highlighting */}
        <p
          style={{
            position: "relative",
            fontSize,
            fontWeight: 900,
            fontFamily: styles.fonts.heading, // Use Montserrat Black
            textTransform: "uppercase",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "0.02em",
            wordBreak: "break-word",
            zIndex: 1,
          }}
        >
          {words.map((word, idx) => {
            const isActive = localTimeMs >= word.startMs && localTimeMs < word.endMs;

            // Color Logic: Active -> Green, Trigger -> Yellow, Normal -> White
            let color = "white";
            if (isActive) color = HIGHLIGHT_COLOR;
            else if (word.isTrigger) color = TRIGGER_COLOR;

            // Shadow Logic
            const textShadow = isActive
              ? `0 0 20px ${HIGHLIGHT_COLOR}, 0 0 40px ${HIGHLIGHT_COLOR}50`
              : word.isTrigger
                ? `0 0 15px ${TRIGGER_COLOR}40`
                : "none";

            // Scale active word slightly
            const wordScale = isActive ? 1.1 : 1.0;

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre-wrap",
                  color,
                  transition: "color 0.1s ease-out, transform 0.1s ease-out",
                  textShadow,
                  transform: `scale(${wordScale})`,
                }}
              >
                {word.text}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// PHASE INDICATOR
// ============================================
const PhaseIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hookEnd = Math.floor(durationInFrames * 0.2);
  const bodyEnd = Math.floor(durationInFrames * 0.8);

  let phase = "HOOK";
  let color = "#f87171";
  if (frame >= hookEnd && frame < bodyEnd) {
    phase = "CONTENT";
    color = "#60a5fa";
  } else if (frame >= bodyEnd) {
    phase = "CTA";
    color = "#4ade80";
  }

  return (
    <div style={{ position: "absolute", top: 24, left: 24, zIndex: 50 }}>
      <span
        style={{
          padding: "4px 10px",
          fontSize: 10,
          fontFamily: "monospace",
          letterSpacing: "0.15em",
          border: `1px solid ${color}50`,
          borderRadius: 4,
          color,
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      >
        {phase}
      </span>
    </div>
  );
};

// ============================================
// MAIN OVERLAY CONTROLLER V4
// ============================================
export const OverlayController: React.FC<OverlayControllerProps> = ({
  config,
  subtitles,
  textPosition = "bottom",
  useKinetic = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const hasSubtitles = subtitles && subtitles.length > 0;

  // === KINETIC MODE: Word-by-word POP animations ===
  if (useKinetic) {
    // Convert subtitles to word timings for kinetic display
    const wordTimings: WordTiming[] = useMemo(() => {
      if (hasSubtitles) {
        return subtitlesToWordTimings(subtitles!, fps);
      }

      // Build word timings from config (hook, points, cta)
      const hookDuration = Math.floor(durationInFrames * 0.2);
      const bodyDuration = Math.floor(durationInFrames * 0.6);
      const ctaDuration = durationInFrames - hookDuration - bodyDuration;

      const timings: WordTiming[] = [];

      // Hook phase
      timings.push(...textToWordTimings(config.hook, 0, hookDuration));

      // Body points
      const pointDuration = Math.floor(bodyDuration / config.points.length);
      config.points.forEach((point, idx) => {
        const startFrame = hookDuration + idx * pointDuration;
        const endFrame = hookDuration + (idx + 1) * pointDuration;
        timings.push(...textToWordTimings(point, startFrame, endFrame));
      });

      // CTA phase
      timings.push(...textToWordTimings(config.cta, hookDuration + bodyDuration, durationInFrames));

      return timings;
    }, [hasSubtitles, subtitles, config, durationInFrames, fps]);

    return (
      <AbsoluteFill>
        <PhaseIndicator />
        <KineticTypography
          words={wordTimings}
          maxVisibleWords={2} // Faster pace for retention
          position={textPosition}
          activeColor="#FFE800" // Toxic Yellow
          enableRotation={true}
          fontSize={85}
          strokeWidth={12}
        />
      </AbsoluteFill>
    );
  }

  // === LEGACY MODE: TikTok-style with sentence highlighting ===
  if (hasSubtitles) {
    const activeSub = subtitles!.find(
      (s) => frame >= s.startFrame && frame <= s.endFrame
    );

    return (
      <AbsoluteFill>
        <PhaseIndicator />
        {activeSub && (
          <TikTokSubtitle
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

  // === V1 Legacy mode (backward compatible) ===
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

      {/* PHASE 1: HOOK — Use TikTok style for impact */}
      {isHookPhase && (
        <TikTokSubtitle
          text={config.hook}
          startFrame={0}
          endFrame={hookDuration}
          style="impact"
          position="center"
        />
      )}

      {/* PHASE 2: BODY POINTS */}
      {isBodyPhase && activePoint && (
        <TikTokSubtitle
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
        <TikTokSubtitle
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
