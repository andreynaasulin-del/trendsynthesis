// ============================================
// TRENDSYNTHESIS — Smart Audio Ducking Hook
// Lowers music volume during voiceover
// ============================================

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface VoiceoverSegment {
  startFrame: number;
  endFrame: number;
}

interface AudioDuckingConfig {
  musicVolumeNormal: number;
  musicVolumeDucked: number;
  fadeFrames: number;
}

const DEFAULT_CONFIG: AudioDuckingConfig = {
  musicVolumeNormal: 0.5,
  musicVolumeDucked: 0.1,
  fadeFrames: 10,
};

/**
 * Smart Audio Ducking Hook
 * Automatically lowers background music volume during voiceover segments
 *
 * @param voiceoverSegments - Array of {startFrame, endFrame} for voiceover
 * @param config - Optional ducking configuration
 * @returns Current music volume (0-1)
 */
export function useAudioDucking(
  voiceoverSegments: VoiceoverSegment[],
  config: Partial<AudioDuckingConfig> = {}
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    musicVolumeNormal,
    musicVolumeDucked,
    fadeFrames,
  } = { ...DEFAULT_CONFIG, ...config };

  // No voiceover segments = full volume
  if (!voiceoverSegments || voiceoverSegments.length === 0) {
    return musicVolumeNormal;
  }

  // Find if we're in a voiceover segment (with fade zones)
  let duckingAmount = 0;

  for (const segment of voiceoverSegments) {
    const fadeInStart = segment.startFrame - fadeFrames;
    const fadeInEnd = segment.startFrame;
    const fadeOutStart = segment.endFrame;
    const fadeOutEnd = segment.endFrame + fadeFrames;

    // Check if frame is in fade-in zone
    if (frame >= fadeInStart && frame < fadeInEnd) {
      const fadeIn = interpolate(
        frame,
        [fadeInStart, fadeInEnd],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      duckingAmount = Math.max(duckingAmount, fadeIn);
    }
    // Check if frame is in voiceover zone
    else if (frame >= fadeInEnd && frame <= fadeOutStart) {
      duckingAmount = 1;
      break; // Max ducking, no need to check further
    }
    // Check if frame is in fade-out zone
    else if (frame > fadeOutStart && frame <= fadeOutEnd) {
      const fadeOut = interpolate(
        frame,
        [fadeOutStart, fadeOutEnd],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      duckingAmount = Math.max(duckingAmount, fadeOut);
    }
  }

  // Interpolate between normal and ducked volume
  return interpolate(
    duckingAmount,
    [0, 1],
    [musicVolumeNormal, musicVolumeDucked]
  );
}

/**
 * Helper: Convert subtitle segments to voiceover segments
 */
export function subtitlesToVoiceoverSegments(
  subtitles: Array<{ startFrame: number; endFrame: number }>
): VoiceoverSegment[] {
  return subtitles.map((s) => ({
    startFrame: s.startFrame,
    endFrame: s.endFrame,
  }));
}
