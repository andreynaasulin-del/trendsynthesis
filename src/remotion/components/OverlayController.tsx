import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import React from "react";

// Types
export interface OverlayConfig {
    hook: string;
    points: string[];
    cta: string;
}

interface AnimatedTextProps {
    text: string;
    delay?: number;
    className?: string;
}

const CyberText: React.FC<AnimatedTextProps> = ({ text, delay = 0, className = "" }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Snappy spring animation
    const entrance = spring({
        fps,
        frame: frame - delay,
        config: {
            damping: 12,
            stiffness: 200,
            mass: 0.5,
        },
    });

    // Glitch effect logic (simple offset flicker)
    const glitch = interpolate(frame, [delay, delay + 5, delay + 10], [0, 5, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const opacity = interpolate(frame, [delay, delay + 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <h1
            style={{
                transform: `translate(${glitch}px, ${interpolate(entrance, [0, 1], [20, 0])}px)`,
                opacity,
            }}
            className={`font-mono font-bold tracking-tighter text-white drop-shadow-lg ${className}`}
        >
            {text.toUpperCase()}
        </h1>
    );
};

export const OverlayController: React.FC<{ config: OverlayConfig }> = ({ config }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Timeline Logic
    const hookDuration = Math.floor(durationInFrames * 0.2); // 20%
    const bodyDuration = Math.floor(durationInFrames * 0.6); // 60%
    const ctaDuration = durationInFrames - hookDuration - bodyDuration; // Remaining 20%

    // Phase Checks
    const isHookPhase = frame < hookDuration;
    const isBodyPhase = frame >= hookDuration && frame < hookDuration + bodyDuration;
    const isCtaPhase = frame >= hookDuration + bodyDuration;

    // Body Sequence Logic (Cycling through points)
    const pointDuration = Math.floor(bodyDuration / config.points.length);
    const currentPointIndex = Math.floor((frame - hookDuration) / pointDuration);
    const activePoint = config.points[Math.min(currentPointIndex, config.points.length - 1)];

    return (
        <AbsoluteFill className="items-center justify-center p-8">
            {/* PHASE 1: THE HOOK */}
            {isHookPhase && (
                <div className="flex flex-col items-center gap-4">
                    <CyberText
                        text={config.hook}
                        className="text-6xl text-center leading-tight bg-black/50 px-4 py-2"
                    />
                </div>
            )}

            {/* PHASE 2: THE MEAT SEQUENCE */}
            {isBodyPhase && activePoint && (
                <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-8 flex justify-center">
                    <CyberText
                        key={activePoint} // Force re-render for animation on change
                        text={activePoint}
                        delay={0}
                        className="text-4xl text-center leading-snug bg-black/60 px-6 py-4 backdrop-blur-sm border-l-4 border-white"
                    />
                </div>
            )}

            {/* PHASE 3: THE LOOP CTA */}
            {isCtaPhase && (
                <div className="flex flex-col items-center justify-center w-full h-full gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 animate-pulse rounded-lg bg-white blur opacity-25"></div>
                        <CyberText
                            text={config.cta}
                            className="relative text-5xl font-black text-center bg-black px-8 py-4 border-2 border-white tracking-tighter"
                        />
                    </div>
                    <CyberText
                        text="LINK IN BIO"
                        delay={15}
                        className="text-xl text-white/80 mt-4 tracking-[0.5em] font-mono"
                    />
                </div>
            )}

            {/* Persistent Watermark */}
            <div className="absolute bottom-10 left-0 w-full text-center">
                <p className="text-[10px] font-mono text-white/30 tracking-widest">PRODUCED BY TRENDSYNTHESIS_AI</p>
            </div>
        </AbsoluteFill>
    );
};
