import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

export const RetentionPulse: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Every 2 seconds (60 frames at 30fps)
    const cycleDuration = fps * 2;
    const progress = (frame % cycleDuration) / cycleDuration;

    // Quick "heartbeat" zoom every 2 seconds to reset attention
    // 0 -> 0.05: Sharp Zoom In (1.0 -> 1.06)
    // 0.05 -> 0.2: Smooth Return (1.06 -> 1.0)
    // Rest: Static

    const scale = interpolate(
        progress,
        [0, 0.05, 0.25, 1], // Timing points
        [1, 1.06, 1, 1],    // Scale values
        {
            easing: Easing.out(Easing.cubic),
            extrapolateRight: "clamp"
        }
    );

    return (
        <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
            {children}
        </AbsoluteFill>
    );
};
