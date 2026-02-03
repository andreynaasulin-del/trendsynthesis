// ============================================
// TRENDSYNTHESIS — Glitch Transition Effect
// RGB-split glitch for visual energy
// ============================================

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from "remotion";
import React from "react";

interface GlitchTransitionProps {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  intensity?: number;
  seed?: string;
}

/**
 * GlitchTransition
 * Wraps content with RGB-split glitch effect
 *
 * @param startFrame - When glitch starts (default: 0)
 * @param duration - How long glitch lasts in frames (default: 8)
 * @param intensity - Glitch strength 0-1 (default: 0.5)
 * @param seed - Random seed for reproducibility
 */
export const GlitchTransition: React.FC<GlitchTransitionProps> = ({
  children,
  startFrame = 0,
  duration = 8,
  intensity = 0.5,
  seed = "glitch",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  const isActive = localFrame >= 0 && localFrame < duration;

  if (!isActive) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // Glitch intensity curve (peak in middle)
  const glitchProgress = interpolate(
    localFrame,
    [0, duration / 2, duration],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const glitchStrength = glitchProgress * intensity;

  // Random offsets per frame (using deterministic random)
  const offsetX = random(`${seed}-x-${localFrame}`) * 20 * glitchStrength;
  const offsetY = random(`${seed}-y-${localFrame}`) * 10 * glitchStrength;

  // RGB channel splits
  const redOffset = random(`${seed}-r-${localFrame}`) * 15 * glitchStrength;
  const blueOffset = random(`${seed}-b-${localFrame}`) * 15 * glitchStrength;

  // Occasional scanline flicker
  const showScanlines = random(`${seed}-scan-${localFrame}`) > 0.6;

  // Occasional horizontal slice
  const sliceY = random(`${seed}-slice-${localFrame}`) * 100;
  const sliceHeight = 5 + random(`${seed}-sliceH-${localFrame}`) * 20;
  const sliceOffset = (random(`${seed}-sliceO-${localFrame}`) - 0.5) * 40 * glitchStrength;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Base layer */}
      <AbsoluteFill
        style={{
          transform: `translate(${offsetX}px, ${offsetY}px)`,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Red channel offset */}
      <AbsoluteFill
        style={{
          transform: `translateX(${redOffset}px)`,
          mixBlendMode: "screen",
          opacity: glitchStrength * 0.4,
          filter: "url(#redChannel)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "red",
            mixBlendMode: "multiply",
          }}
        />
      </AbsoluteFill>

      {/* Blue channel offset */}
      <AbsoluteFill
        style={{
          transform: `translateX(-${blueOffset}px)`,
          mixBlendMode: "screen",
          opacity: glitchStrength * 0.4,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "blue",
            mixBlendMode: "multiply",
          }}
        />
      </AbsoluteFill>

      {/* Horizontal slice displacement */}
      {glitchStrength > 0.3 && (
        <AbsoluteFill
          style={{
            clipPath: `inset(${sliceY}% 0 ${100 - sliceY - sliceHeight / 10}% 0)`,
            transform: `translateX(${sliceOffset}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      )}

      {/* Scanlines overlay */}
      {showScanlines && (
        <AbsoluteFill
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, ${glitchStrength * 0.3}) 2px,
              rgba(0, 0, 0, ${glitchStrength * 0.3}) 4px
            )`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Chromatic aberration border */}
      <AbsoluteFill
        style={{
          boxShadow: `
            inset ${redOffset}px 0 0 rgba(255, 0, 0, ${glitchStrength * 0.2}),
            inset -${blueOffset}px 0 0 rgba(0, 0, 255, ${glitchStrength * 0.2})
          `,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Quick glitch flash (for transitions)
 */
export const GlitchFlash: React.FC<{
  children: React.ReactNode;
  trigger?: boolean;
}> = ({ children, trigger = false }) => {
  const frame = useCurrentFrame();

  if (!trigger) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  return (
    <GlitchTransition
      startFrame={0}
      duration={6}
      intensity={0.8}
      seed={`flash-${frame}`}
    >
      {children}
    </GlitchTransition>
  );
};
