// ============================================
// TRENDSYNTHESIS — Overlay Controller V3
// TikTok-style captions with word highlighting
// Skills Integration: template-tiktok
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

// --- TikTok Style Constants ---
const HIGHLIGHT_COLOR = "#39E508"; // Bright green like template-tiktok
const WORD_DURATION_MS = 400; // How long each word stays highlighted

// ============================================
// TIKTOK-STYLE ANIMATED WORD (from template-tiktok)
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
    return wordList.map((word, idx) => ({
      text: word,
      startMs: idx * wordDuration,
      endMs: (idx + 1) * wordDuration,
    }));
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
    bottom: { bottom: "8%", top: undefined }, // Lower position to avoid cut-off
  };

  // Style variants - reduced font sizes for better fit
  const fontSizes: Record<string, number> = {
    default: 36,
    highlight: 42,
    impact: 48, // Reduced from 56 to prevent text cut-off
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
        paddingBottom: position === "bottom" ? 40 : 0, // Extra safe area at bottom
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scaleValue}) translateY(${translateY}px)`,
          textAlign: "center",
          maxWidth: "95%",
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
            fontFamily: "system-ui, -apple-system, sans-serif",
            textTransform: "uppercase",
            color: "white",
            WebkitTextStroke: "6px black", // Reduced stroke for cleaner look
            paintOrder: "stroke",
            margin: 0,
            lineHeight: 1.1, // Tighter line height
            letterSpacing: "0.01em",
            wordBreak: "break-word",
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
            fontFamily: "system-ui, -apple-system, sans-serif",
            textTransform: "uppercase",
            margin: 0,
            lineHeight: 1.15, // Tighter line height
            letterSpacing: "0.01em",
            wordBreak: "break-word",
          }}
        >
          {words.map((word, idx) => {
            const isActive =
              localTimeMs >= word.startMs && localTimeMs < word.endMs;

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre-wrap",
                  color: isActive ? HIGHLIGHT_COLOR : "white",
                  transition: "color 0.05s ease-out",
                  textShadow: isActive
                    ? `0 0 20px ${HIGHLIGHT_COLOR}, 0 0 40px ${HIGHLIGHT_COLOR}50`
                    : "none",
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
// SIMPLE ANIMATED SUBTITLE (fallback for non-TikTok mode)
// ============================================
const AnimatedSubtitle: React.FC<{
  text: string;
  startFrame: number;
  endFrame: number;
  style?: "default" | "highlight" | "impact";
  position: "center" | "bottom" | "top";
}> = ({ text, startFrame, endFrame, style = "default", position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  const entrance = spring({
    fps,
    frame: localFrame,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });

  const exitStart = duration - 8;
  const exitOpacity = interpolate(
    localFrame,
    [exitStart, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(entrance, [0, 1], [25, 0]);
  const scale = style === "impact" ? interpolate(entrance, [0, 1], [0.85, 1]) : 1;

  const positionStyles: Record<string, React.CSSProperties> = {
    top: { position: "absolute", top: "15%", left: 0, right: 0, paddingLeft: 32, paddingRight: 32 },
    center: { position: "absolute", top: "50%", left: 0, right: 0, paddingLeft: 32, paddingRight: 32 },
    bottom: { position: "absolute", bottom: "12%", left: 0, right: 0, paddingLeft: 32, paddingRight: 32 },
  };

  const styleClasses: Record<string, React.CSSProperties> = {
    default: { backgroundColor: "rgba(0,0,0,0.5)", padding: "12px 24px", borderRadius: 8 },
    highlight: { backgroundColor: "rgba(0,0,0,0.6)", padding: "12px 24px", borderRadius: 8, borderLeft: "4px solid white" },
    impact: { backgroundColor: "rgba(0,0,0,0.7)", padding: "16px 32px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)" },
  };

  const fontSizes: Record<string, number> = {
    default: 20,
    highlight: 24,
    impact: 36,
  };

  return (
    <div
      style={{
        ...positionStyles[position],
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: exitOpacity,
        display: "flex",
        justifyContent: "center",
        zIndex: 40,
      }}
    >
      <div style={{ ...styleClasses[style], backdropFilter: "blur(8px)" }}>
        <p
          style={{
            fontSize: fontSizes[style],
            fontWeight: style === "impact" ? 900 : 600,
            color: "white",
            textTransform: "uppercase",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.05em",
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

// ============================================
// MAIN OVERLAY CONTROLLER V3
// ============================================
export const OverlayController: React.FC<OverlayControllerProps> = ({
  config,
  subtitles,
  textPosition = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hasSubtitles = subtitles && subtitles.length > 0;

  // --- V2/V3: Subtitle-driven mode with TikTok highlighting ---
  if (hasSubtitles) {
    const activeSub = subtitles.find(
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
