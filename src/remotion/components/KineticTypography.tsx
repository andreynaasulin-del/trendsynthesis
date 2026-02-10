// ============================================
// TRENDSYNTHESIS — Kinetic Typography Engine
// High-impact word-by-word "POP" animations
// Inspired by: Hormozi, Alex Becker, viral TikTok
// ============================================

import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";

// --- Types ---
export interface WordTiming {
  word: string;
  start: number; // Frame when word appears
  end: number;   // Frame when word disappears
}

export interface KineticTypographyProps {
  /** Array of words with timing info (from whisper/transcription) */
  words: WordTiming[];
  /** Maximum words visible at once (1-3 recommended) */
  maxVisibleWords?: number;
  /** Position on screen */
  position?: "center" | "bottom" | "top";
  /** Active word highlight color */
  activeColor?: string;
  /** Enable random rotation for organic feel */
  enableRotation?: boolean;
  /** Font size in pixels */
  fontSize?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
}

// --- Constants (TikTok Aggressive Style) ---
const DEFAULT_ACTIVE_COLOR = "#FFE800"; // Toxic Yellow
const DEFAULT_STROKE_WIDTH = 12;
const DEFAULT_FONT_SIZE = 85;

// High-impact trigger words (English + Russian)
const TRIGGER_WORDS = [
  // EN
  "MONEY", "RICH", "WEALTH", "CASH", "DOLLAR", "MILLION", "BILLION",
  "AI", "GPT", "CRYPTO", "BITCOIN", "NFT",
  "SECRET", "HACK", "SYSTEM", "FREE", "NOW", "TODAY",
  "VIRAL", "TRENDING", "INSANE", "CRAZY", "MIND",
  "GOD", "MODE", "POWER", "LEVEL", "PRO",
  // RU
  "ДЕНЬГИ", "БОГАТСТВО", "КЕШ", "ДОЛЛАР", "МИЛЛИОН", "МИЛЛИАРД",
  "КРИПТА", "БИТКОИН", "НФТ",
  "СЕКРЕТ", "ХАК", "СИСТЕМА", "БЕСПЛАТНО", "СЕЙЧАС", "СЕГОДНЯ",
  "ВИРУС", "ТРЕНД", "ШОК", "ЖЕСТЬ", "БЕЗУМИЕ",
  "БОГ", "РЕЖИМ", "СИЛА", "УРОВЕНЬ", "ПРО",
  "ОШИБКА", "СТОП", "ВНИМАНИЕ", "ВАЖНО",
];

// --- Helper: Generate pseudo-random rotation ---
function getWordRotation(word: string, index: number): number {
  // Use word characters to create deterministic "random" rotation
  const seed = word.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  const rotation = ((seed + index * 9) % 7) - 3.5; // Range: -3.5 to +3.5 degrees (more chaotic)
  return rotation;
}

// --- Helper: Check if word is a trigger word ---
function isTriggerWord(word: string): boolean {
  const cleanWord = word.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, "").toUpperCase();
  return TRIGGER_WORDS.some(trigger => cleanWord.includes(trigger));
}

// ============================================
// SINGLE WORD COMPONENT WITH POP EFFECT
// ============================================
const PopWord: React.FC<{
  word: string;
  wordIndex: number;
  isActive: boolean;
  isVisible: boolean;
  localFrame: number; // Frame since this word appeared
  activeColor: string;
  fontSize: number;
  strokeWidth: number;
  enableRotation: boolean;
}> = ({
  word,
  wordIndex,
  isActive,
  isVisible,
  localFrame,
  activeColor,
  fontSize,
  strokeWidth,
  enableRotation,
}) => {
    const { fps } = useVideoConfig();

    if (!isVisible) return null;

    // === POP ANIMATION (Aggressive Spring) ===
    const popSpring = spring({
      fps,
      frame: localFrame,
      config: {
        damping: 12,       // Less bounce, more punch
        stiffness: 250,    // Very stiff (fast)
        mass: 0.8,         // Heavy impact
      },
      durationInFrames: 8, // Faster entrance
    });

    // Scale: 0.5 -> 1.4 (huge overshoot) -> 1.0
    const scale = interpolate(
      popSpring,
      [0, 1],
      [0.5, 1.0],
      { extrapolateRight: "clamp" }
    );

    // Active word gets MASSIVE scale boost
    const activeScale = isActive ? 1.35 : 1.0;

    // Y offset for entrance (slide up)
    const translateY = interpolate(
      popSpring,
      [0, 1],
      [80, 0],
      { extrapolateRight: "clamp" }
    );

    // Rotation for organic feel (increased chaos)
    const rotation = enableRotation ? getWordRotation(word, wordIndex) : 0;

    // === COLOR LOGIC ===
    const trigger = isTriggerWord(word);
    let color = "white";
    let currentColor = activeColor;

    if (isActive) {
      color = activeColor;
      // Alternate colors for triggers
      if (trigger) currentColor = "#00FF00"; // Toxic Green for triggers
    } else if (trigger) {
      color = "#FF2A00"; // Red/Orange for inactive triggers
    }

    // === GLOW EFFECT ===
    const glowOpacity = isActive ? 1 : 0;
    // Hard shadow instead of blur for clarity
    const shadowOffset = isActive ? 8 : 4;

    // === OPACITY ===
    const opacity = interpolate(popSpring, [0, 0.4], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <span
        style={{
          display: "inline-block",
          position: "relative",
          margin: "0 12px", // More spacing
          transform: `
          scale(${scale * activeScale})
          translateY(${translateY}px)
          rotate(${rotation}deg)
        `,
          transformOrigin: "center center",
          opacity,
          transition: "color 0.1s ease-out", // Snappy color change
        }}
      >
        {/* 1. Heavy Black Stroke (Background) */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            fontFamily: "'Montserrat', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize,
            textTransform: "uppercase",
            letterSpacing: "0.05em", // Wider cadence
            color: "transparent",
            WebkitTextStroke: `${strokeWidth * 1.5}px black`, // Thicker outer stroke
            zIndex: 0,
          }}
        >
          {word}
        </span>

        {/* 2. Inner Stroke (Contrast) */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            fontFamily: "'Montserrat', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "transparent",
            WebkitTextStroke: `${strokeWidth}px black`,
            zIndex: 1,
          }}
        >
          {word}
        </span>

        {/* 3. Drop Shadow (Hard) */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            fontFamily: "'Montserrat', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "black",
            transform: `translate(${shadowOffset}px, ${shadowOffset}px)`,
            zIndex: 2,
          }}
        >
          {word}
        </span>

        {/* 4. Main Text (Foreground) */}
        <span
          style={{
            position: "relative",
            fontFamily: "'Montserrat', 'Impact', sans-serif",
            fontWeight: 900,
            fontSize,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: isActive ? currentColor : color,
            zIndex: 3,
          }}
        >
          {word}
        </span>
      </span>
    );
  };

// ============================================
// MAIN KINETIC TYPOGRAPHY COMPONENT
// ============================================
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  words,
  maxVisibleWords = 3, // Reduced for TikTok speed (1-3 words visible)
  position = "center",
  activeColor = DEFAULT_ACTIVE_COLOR,
  enableRotation = true,
  fontSize = DEFAULT_FONT_SIZE,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // Find currently visible words (sliding window)
  const visibleWords = useMemo(() => {
    // Find current word index
    let currentIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (frame >= words[i].start && frame < words[i].end) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex === -1) {
      // Check if we're past all words
      if (words.length > 0 && frame >= words[words.length - 1].end) {
        // Show last few words fading out
        const startIdx = Math.max(0, words.length - maxVisibleWords);
        return words.slice(startIdx).map((w, idx) => ({
          ...w,
          isActive: false,
          index: startIdx + idx,
          localFrame: frame - w.start,
        }));
      }
      return [];
    }

    // Calculate window of visible words
    const windowStart = Math.max(0, currentIndex - Math.floor(maxVisibleWords / 2));
    const windowEnd = Math.min(words.length, windowStart + maxVisibleWords);

    return words.slice(windowStart, windowEnd).map((w, idx) => ({
      ...w,
      isActive: windowStart + idx === currentIndex,
      index: windowStart + idx,
      localFrame: Math.max(0, frame - w.start),
    }));
  }, [frame, words, maxVisibleWords]);

  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: "10%",
      bottom: "auto",
    },
    center: {
      top: "50%",
      transform: "translateY(-50%)",
    },
    bottom: {
      bottom: "15%",
      top: "auto",
    },
  };

  // Responsive font size
  const responsiveFontSize = Math.min(fontSize, height * 0.06);

  return (
    <AbsoluteFill
      style={{
        ...positionStyles[position],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 32px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "90%",
          gap: "4px 0",
        }}
      >
        {visibleWords.map((wordData) => (
          <PopWord
            key={`${wordData.word}-${wordData.index}`}
            word={wordData.word}
            wordIndex={wordData.index}
            isActive={wordData.isActive}
            isVisible={true}
            localFrame={wordData.localFrame}
            activeColor={activeColor}
            fontSize={responsiveFontSize}
            strokeWidth={strokeWidth}
            enableRotation={enableRotation}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// UTILITY: Convert SubtitleSegments to WordTimings
// ============================================
export function subtitlesToWordTimings(
  subtitles: Array<{
    text: string;
    startFrame: number;
    endFrame: number;
  }>,
  fps: number = 30
): WordTiming[] {
  const wordTimings: WordTiming[] = [];

  for (const segment of subtitles) {
    const words = segment.text.split(" ").filter(Boolean);
    const segmentDuration = segment.endFrame - segment.startFrame;
    const wordDuration = segmentDuration / words.length;

    words.forEach((word, idx) => {
      wordTimings.push({
        word,
        start: Math.floor(segment.startFrame + idx * wordDuration),
        end: Math.floor(segment.startFrame + (idx + 1) * wordDuration),
      });
    });
  }

  return wordTimings;
}

// ============================================
// UTILITY: Create word timings from text + duration
// ============================================
export function textToWordTimings(
  text: string,
  startFrame: number,
  endFrame: number
): WordTiming[] {
  const words = text.split(" ").filter(Boolean);
  const totalDuration = endFrame - startFrame;
  const wordDuration = totalDuration / words.length;

  return words.map((word, idx) => ({
    word,
    start: Math.floor(startFrame + idx * wordDuration),
    end: Math.floor(startFrame + (idx + 1) * wordDuration),
  }));
}

export default KineticTypography;
