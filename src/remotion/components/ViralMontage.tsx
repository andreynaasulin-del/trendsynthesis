// ============================================
// TRENDSYNTHESIS — Viral Montage Engine V3.1
// Skills Integration: AI Video + TikTok Captions
// Pro Features: Audio Ducking, Glitch, Shake
// ============================================

import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from "remotion";
import React, { useMemo } from "react";
import { OverlayController } from "./OverlayController";
import {
  useAudioDucking,
  subtitlesToVoiceoverSegments,
} from "@/remotion/hooks/useAudioDucking";
import { GlitchTransition } from "@/remotion/effects/GlitchTransition";
import { CameraShake, ImpactShake } from "@/remotion/effects/CameraShake";
import type { SubtitleSegment, MontageStyle, TransitionType, ScenarioTone } from "@/types";
import { styles } from "../styles";

const { heading: headingFont, body: bodyFont } = styles.fonts;

// --- Constants (from skills) ---
const FPS = 30;
const INTRO_DURATION_FRAMES = FPS * 1.5; // 1.5 seconds intro
const OUTRO_DURATION_FRAMES = FPS * 2; // 2 seconds outro

// --- Props ---
export interface ViralMontageProps {
  assets: string[];
  strategy: {
    hook_text: string;
    title: string;
    description: string;
  };
  subtitles?: SubtitleSegment[];
  montageStyle?: MontageStyle;
  showIntro?: boolean;
  showOutro?: boolean;
  // V3.1 Pro Features
  musicUrl?: string;
  tone?: ScenarioTone;
  enableGlitch?: boolean;
  enableShake?: boolean;
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

// ============================================
// AUDIO LAYER WITH DUCKING
// ============================================
const MusicLayer: React.FC<{
  musicUrl: string;
  subtitles?: SubtitleSegment[];
}> = ({ musicUrl, subtitles }) => {
  // Convert subtitles to voiceover segments for ducking
  const voiceoverSegments = useMemo(() => {
    return subtitles ? subtitlesToVoiceoverSegments(subtitles) : [];
  }, [subtitles]);

  // Get ducked volume
  const musicVolume = useAudioDucking(voiceoverSegments, {
    musicVolumeNormal: 0.5,
    musicVolumeDucked: 0.1,
    fadeFrames: 10,
  });

  return <Audio src={musicUrl} volume={musicVolume} />;
};

// ============================================
// INTRO SLIDE (from template-prompt-to-video)
// ============================================
const IntroSlide: React.FC<{
  title: string;
  hook: string;
}> = ({ title, hook }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  // Spring entrance for title
  const titleScale = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 200, mass: 0.8 },
    durationInFrames: 15,
  });

  // Delayed spring for hook text
  const hookProgress = spring({
    fps,
    frame: Math.max(0, frame - 12),
    config: { damping: 14, stiffness: 160 },
    durationInFrames: 12,
  });

  // Fade out near end
  const fadeOut = interpolate(
    frame,
    [INTRO_DURATION_FRAMES - 10, INTRO_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 50%),
            linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)
          `,
        }}
      />

      {/* Main title box (like template-prompt-to-video) */}
      {/* Main title box (like template-prompt-to-video) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: 40,
          transform: `scale(${interpolate(titleScale, [0, 1], [0.8, 1])})`,
          opacity: titleScale,
        }}
      >
        {/* Title badge */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px 40px",
            borderRadius: 8,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              fontSize: Math.min(72, height * 0.04),
              fontWeight: 900,
              color: "black",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
              fontFamily: headingFont,
            }}
          >
            {title.length > 20 ? title.slice(0, 20) + "..." : title}
          </p>
        </div>

        {/* Hook text below */}
        <div
          style={{
            transform: `translateY(${interpolate(hookProgress, [0, 1], [30, 0])}px)`,
            opacity: hookProgress,
          }}
        >
          <p
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              fontFamily: bodyFont,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {hook.length > 40 ? hook.slice(0, 40) + "..." : hook}
          </p>
        </div>
      </div>

      {/* Corner branding */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontFamily: bodyFont,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.3em",
          }}
        >
          TRENDSYNTHESIS
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// OUTRO SLIDE
// ============================================
const OutroSlide: React.FC<{
  cta: string;
}> = ({ cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    fps,
    frame,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
          opacity: entrance,
        }}
      >
        {/* CTA Box */}
        <div
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            padding: "24px 48px",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(139,92,246,0.4)",
          }}
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            {cta}
          </p>
        </div>

        {/* Follow prompt */}
        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "monospace",
          }}
        >
          FOLLOW FOR MORE
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// KEN BURNS EFFECT (Enhanced)
// ============================================
const KenBurnsClip: React.FC<{
  src: string;
  clipIndex: number;
  clipDuration: number;
  blurTransition?: boolean;
}> = ({ src, clipIndex, clipDuration, blurTransition = true }) => {
  const frame = useCurrentFrame();

  // Alternate zoom direction
  const isZoomIn = clipIndex % 2 === 0;
  const startScale = isZoomIn ? 1.0 : 1.15;
  const endScale = isZoomIn ? 1.15 : 1.0;

  // Pan directions
  const panDirections = [
    { x: [0, -3], y: [0, -2] },
    { x: [0, 3], y: [0, -1] },
    { x: [-2, 2], y: [0, 0] },
    { x: [0, -2], y: [1, -1] },
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

  // Blur transition (from template-prompt-to-video)
  const blurIn = blurTransition
    ? interpolate(frame, [0, 8], [15, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
    : 0;

  const blurOut = blurTransition
    ? interpolate(frame, [clipDuration - 8, clipDuration], [0, 15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
    : 0;

  const blur = Math.max(blurIn, blurOut);

  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <OffthreadVideo
        src={src}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          filter: `blur(${blur}px)`,
          WebkitFilter: `blur(${blur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// STATIC VIDEO CLIP (no effects)
// ============================================
const StaticClip: React.FC<{
  src: string;
  clipDuration: number;
  blurTransition?: boolean;
}> = ({ src, clipDuration, blurTransition = true }) => {
  const frame = useCurrentFrame();

  const blurIn = blurTransition
    ? interpolate(frame, [0, 8], [15, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
    : 0;

  const blurOut = blurTransition
    ? interpolate(frame, [clipDuration - 8, clipDuration], [0, 15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
    : 0;

  const blur = Math.max(blurIn, blurOut);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={src}
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          transform: "scale(1.02)",
          filter: `blur(${blur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ============================================
// TRANSITION OVERLAY
// ============================================
const TransitionOverlay: React.FC<{
  type: TransitionType;
  clipDuration: number;
  transitionFrames: number;
}> = ({ type, clipDuration, transitionFrames }) => {
  const frame = useCurrentFrame();

  if (type === "cut") return null;

  const fadeIn = interpolate(frame, [0, transitionFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          opacity: fadeOut * 0.7,
        }}
      />
    );
  }

  return null;
};

// ============================================
// COLOR GRADE FILTER
// ============================================
const ColorGradeFilter: React.FC<{
  grade: MontageStyle["colorGrade"];
}> = ({ grade }) => {
  if (grade === "none") return null;

  const overlays: Record<string, React.CSSProperties> = {
    cinematic: {
      background: "linear-gradient(to bottom, rgba(0,0,30,0.15), rgba(0,0,0,0.05))",
      mixBlendMode: "multiply" as const,
    },
    cold: {
      background: "linear-gradient(135deg, rgba(0,30,80,0.2), rgba(0,10,40,0.1))",
      mixBlendMode: "overlay" as const,
    },
    warm: {
      background: "linear-gradient(135deg, rgba(80,40,0,0.15), rgba(50,25,0,0.08))",
      mixBlendMode: "overlay" as const,
    },
    cyberpunk: {
      background: "linear-gradient(135deg, rgba(30,0,60,0.35), rgba(0,200,200,0.05))",
      mixBlendMode: "overlay" as const,
    },
  };

  const style = overlays[grade];
  if (!style) return null;

  return <AbsoluteFill style={style} />;
};

// ============================================
// PROGRESS BAR
// ============================================
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 3,
        backgroundColor: "rgba(255,255,255,0.1)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          backgroundColor: "rgba(255,255,255,0.8)",
          boxShadow: "0 0 10px rgba(255,255,255,0.6)",
        }}
      />
    </div>
  );
};

// ============================================
// MAIN V3.1 MONTAGE COMPONENT
// ============================================
export const ViralMontage: React.FC<ViralMontageProps> = ({
  assets,
  strategy,
  subtitles,
  montageStyle,
  showIntro = true,
  showOutro = true,
  // V3.1 Pro Features
  musicUrl,
  tone,
  enableGlitch = false,
  enableShake = false,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const style = montageStyle || DEFAULT_STYLE;

  // Calculate timing
  const introFrames = showIntro ? INTRO_DURATION_FRAMES : 0;
  const outroFrames = showOutro ? OUTRO_DURATION_FRAMES : 0;
  const contentFrames = durationInFrames - introFrames - outroFrames;

  // Transition config
  const TRANSITION_FRAMES = style.transition === "cut" ? 0 : 10;

  // Clip distribution
  const clipCount = assets.length || 1;
  const CLIP_DURATION = Math.floor(contentFrames / clipCount);

  // Auto-enable effects based on tone
  const shouldGlitch = enableGlitch || tone === "provocative";
  const shouldShake = enableShake || tone === "provocative" || tone === "emotional";

  // Determine if we're at a clip transition (for glitch effect)
  const isAtClipTransition = useMemo(() => {
    if (!shouldGlitch) return false;
    const relativeFrame = frame - introFrames;
    if (relativeFrame < 0 || relativeFrame >= contentFrames) return false;

    for (let i = 1; i < clipCount; i++) {
      const transitionFrame = i * CLIP_DURATION;
      if (relativeFrame >= transitionFrame - 4 && relativeFrame <= transitionFrame + 4) {
        return true;
      }
    }
    return false;
  }, [frame, introFrames, contentFrames, clipCount, CLIP_DURATION, shouldGlitch]);

  // No assets fallback
  if (!assets || assets.length === 0) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 24, color: "rgba(255,255,255,0.4)" }}>⚠</span>
          </div>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.2em",
            }}
          >
            NO ASSETS LOADED
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // Main content with optional shake wrapper
  const MainContent = (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* ===== BACKGROUND MUSIC WITH DUCKING ===== */}
      {musicUrl && (
        <MusicLayer musicUrl={musicUrl} subtitles={subtitles} />
      )}

      {/* ===== INTRO SLIDE ===== */}
      {showIntro && (
        <Sequence durationInFrames={introFrames}>
          <IntroSlide title={strategy.title} hook={strategy.hook_text} />
        </Sequence>
      )}

      {/* ===== MAIN CONTENT: VIDEO CLIPS ===== */}
      {assets.map((src, index) => {
        const clipStartFrame = introFrames + index * CLIP_DURATION;
        const isFirstFrameOfClip = frame >= clipStartFrame && frame < clipStartFrame + 8;

        return (
          <Sequence
            key={`clip-${index}`}
            from={clipStartFrame}
            durationInFrames={CLIP_DURATION}
          >
            {/* Glitch transition at clip boundaries */}
            {shouldGlitch && index > 0 ? (
              <GlitchTransition
                startFrame={0}
                duration={8}
                intensity={0.6}
                seed={`clip-${index}`}
              >
                {/* Video with Ken Burns or static */}
                {style.kenBurns ? (
                  <KenBurnsClip
                    src={src}
                    clipIndex={index}
                    clipDuration={CLIP_DURATION}
                    blurTransition={style.transition !== "cut"}
                  />
                ) : (
                  <StaticClip
                    src={src}
                    clipDuration={CLIP_DURATION}
                    blurTransition={style.transition !== "cut"}
                  />
                )}
              </GlitchTransition>
            ) : (
              <>
                {/* Video with Ken Burns or static (no glitch) */}
                {style.kenBurns ? (
                  <KenBurnsClip
                    src={src}
                    clipIndex={index}
                    clipDuration={CLIP_DURATION}
                    blurTransition={style.transition !== "cut"}
                  />
                ) : (
                  <StaticClip
                    src={src}
                    clipDuration={CLIP_DURATION}
                    blurTransition={style.transition !== "cut"}
                  />
                )}
              </>
            )}

            {/* Transition overlay */}
            {index > 0 && !shouldGlitch && (
              <TransitionOverlay
                type={style.transition}
                clipDuration={CLIP_DURATION}
                transitionFrames={TRANSITION_FRAMES}
              />
            )}
          </Sequence>
        );
      })}

      {/* ===== OUTRO SLIDE ===== */}
      {showOutro && (
        <Sequence from={durationInFrames - outroFrames} durationInFrames={outroFrames}>
          <OutroSlide cta="LINK IN BIO" />
        </Sequence>
      )}

      {/* ===== COLOR GRADE (over video content only) ===== */}
      <Sequence from={introFrames} durationInFrames={contentFrames}>
        <ColorGradeFilter grade={style.colorGrade} />
      </Sequence>

      {/* ===== DARK GRADIENT OVERLAY ===== */}
      <Sequence from={introFrames} durationInFrames={contentFrames}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom,
              rgba(0,0,0,${style.overlayOpacity * 0.25}) 0%,
              rgba(0,0,0,${style.overlayOpacity * 0.08}) 30%,
              rgba(0,0,0,${style.overlayOpacity * 0.08}) 60%,
              rgba(0,0,0,${style.overlayOpacity * 0.65}) 100%)`,
          }}
        />
      </Sequence>

      {/* ===== SUBTITLES OVERLAY ===== */}
      <Sequence from={introFrames} durationInFrames={contentFrames}>
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
      </Sequence>

      {/* ===== PROGRESS BAR ===== */}
      {style.progressBar && <ProgressBar />}

      {/* ===== WATERMARK ===== */}
      {style.watermark && (
        <Sequence from={introFrames} durationInFrames={contentFrames}>
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              zIndex: 50,
            }}
          >
            <p
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.3em",
              }}
            >
              TRENDSYNTHESIS
            </p>
          </div>
        </Sequence>
      )}
    </AbsoluteFill>
  );

  // Wrap with shake effect if enabled
  if (shouldShake) {
    return (
      <CameraShake intensity={1.5} frequency={0.5} decay={false}>
        {MainContent}
      </CameraShake>
    );
  }

  return MainContent;
};
