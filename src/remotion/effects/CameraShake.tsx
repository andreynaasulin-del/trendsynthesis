// ============================================
// TRENDSYNTHESIS — Camera Shake Effect
// Sin/Cos wave-based screen shake
// ============================================

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import React from "react";

interface CameraShakeProps {
  children: React.ReactNode;
  intensity?: number;
  frequency?: number;
  startFrame?: number;
  duration?: number;
  rotation?: boolean;
  decay?: boolean;
}

/**
 * CameraShake
 * Applies shake effect using sin/cos waves
 *
 * @param intensity - Shake strength in pixels (default: 5)
 * @param frequency - Shake speed (default: 2)
 * @param startFrame - When shake starts (default: 0)
 * @param duration - How long shake lasts in frames (optional, continuous if not set)
 * @param rotation - Add rotational shake (default: false)
 * @param decay - Fade out shake over duration (default: true)
 */
export const CameraShake: React.FC<CameraShakeProps> = ({
  children,
  intensity = 5,
  frequency = 2,
  startFrame = 0,
  duration,
  rotation = false,
  decay = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;

  // Not started yet
  if (localFrame < 0) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // Past duration (if set)
  if (duration !== undefined && localFrame >= duration) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // Calculate decay multiplier
  let decayMultiplier = 1;
  if (decay && duration !== undefined) {
    decayMultiplier = interpolate(
      localFrame,
      [0, duration],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }

  // Time in seconds for smoother waves
  const time = localFrame / fps;

  // Sin/Cos based shake with multiple frequencies for organic feel
  const shakeX =
    Math.sin(time * frequency * Math.PI * 2) * intensity * 0.7 +
    Math.cos(time * frequency * 1.5 * Math.PI * 2) * intensity * 0.3;

  const shakeY =
    Math.cos(time * frequency * Math.PI * 2) * intensity * 0.5 +
    Math.sin(time * frequency * 1.3 * Math.PI * 2) * intensity * 0.5;

  // Optional rotation shake (subtle)
  const shakeRotation = rotation
    ? Math.sin(time * frequency * 0.8 * Math.PI * 2) * (intensity * 0.15)
    : 0;

  // Apply decay
  const finalX = shakeX * decayMultiplier;
  const finalY = shakeY * decayMultiplier;
  const finalRotation = shakeRotation * decayMultiplier;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${finalX}px, ${finalY}px) rotate(${finalRotation}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Impact Shake — Short, strong burst (for punchy moments)
 */
export const ImpactShake: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  strength?: "light" | "medium" | "heavy";
}> = ({ children, active = false, strength = "medium" }) => {
  if (!active) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const intensityMap = {
    light: 3,
    medium: 6,
    heavy: 12,
  };

  return (
    <CameraShake
      intensity={intensityMap[strength]}
      frequency={4}
      duration={12}
      rotation={strength === "heavy"}
      decay={true}
    >
      {children}
    </CameraShake>
  );
};

/**
 * Continuous subtle shake (for energetic videos)
 */
export const EnergyShake: React.FC<{
  children: React.ReactNode;
  enabled?: boolean;
}> = ({ children, enabled = true }) => {
  if (!enabled) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  return (
    <CameraShake intensity={1.5} frequency={0.8} decay={false}>
      {children}
    </CameraShake>
  );
};
