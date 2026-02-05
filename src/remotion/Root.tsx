// ============================================
// TRENDSYNTHESIS — Remotion Root
// Registers all compositions for CLI/Lambda rendering
// ============================================

import React from "react";
import { Composition } from "remotion";
import { ViralMontage } from "./components/ViralMontage";
import type { ViralMontageProps } from "./components/ViralMontage";

const defaultProps: ViralMontageProps = {
  assets: [],
  strategy: {
    hook_text: "PREVIEW",
    title: "TRENDSYNTHESIS",
    description: "AI Video Generator",
  },
  subtitles: [],
  montageStyle: {
    transition: "crossfade",
    kenBurns: true,
    overlayOpacity: 0.4,
    textPosition: "bottom",
    progressBar: true,
    watermark: true,
    colorGrade: "cyberpunk",
  },
  showIntro: true,
  showOutro: true,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ViralMontage"
        component={ViralMontage}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="ViralMontage30s"
        component={ViralMontage}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="ViralMontage60s"
        component={ViralMontage}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
    </>
  );
};
