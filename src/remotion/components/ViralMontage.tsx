import { AbsoluteFill, Sequence, Video } from "remotion";
import React from "react";
import { OverlayController } from "./OverlayController";

export interface ViralMontageProps {
    assets: string[];
    strategy: {
        hook_text: string;
        title: string;
        description: string;
    };
}

export const ViralMontage: React.FC<ViralMontageProps> = ({ assets, strategy }) => {
    // Hardcoded logic for 15s video (typical for viral shorts)
    // 4 clips, ~3.75s each. or 3s, 4s, 5s... 
    // Let's do 4 clips of equal length if we have 4.
    const TOTAL_DURATION = 30 * 15; // 450 frames @ 30fps
    const CLIP_DURATION = Math.floor(TOTAL_DURATION / (assets.length || 1));

    // Fallback if no assets
    if (!assets || assets.length === 0) {
        return (
            <AbsoluteFill className="bg-black items-center justify-center">
                <h1 className="text-white">NO ASSETS FOUND</h1>
            </AbsoluteFill>
        );
    }

    return (
        <AbsoluteFill className="bg-black">
            {/* BACKGROUND LAYER: MONTAGE */}
            {assets.map((src, index) => (
                <Sequence
                    key={index}
                    from={index * CLIP_DURATION}
                    durationInFrames={CLIP_DURATION}
                    className="overflow-hidden"
                >
                    {/* Scale video slightly to fill generic aspect ratios */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                        <Video
                            src={src}
                            style={{
                                height: "100%",
                                width: "100%",
                                objectFit: "cover",
                                transform: "scale(1.05)" // Zoom in to remove minor black bars
                            }}
                        />
                    </div>
                </Sequence>
            ))}

            {/* FOREGROUND LAYER: OVERLAYS */}
            {/* We map the strategy data to the OverlayController config */}
            <OverlayController
                config={{
                    hook: strategy.hook_text,
                    // Derive dynamic points from description or hardcode for now
                    points: [
                        strategy.title.toUpperCase(),
                        "TRENDING NOW",
                        "WATCH TILL END"
                    ],
                    cta: "LINK IN BIO"
                }}
            />
        </AbsoluteFill>
    );
};
