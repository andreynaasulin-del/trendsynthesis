// ============================================
// TRENDSYNTHESIS — Thumbnail Generator
// Static viral cover image for videos
// ============================================

import {
  AbsoluteFill,
  Img,
  staticFile,
  useVideoConfig,
} from "remotion";
import React from "react";

// --- Props ---
export interface ThumbnailProps {
  backgroundUrl?: string;
  hookText: string;
  title?: string;
  showPlayButton?: boolean;
  style?: "bold" | "minimal" | "neon";
}

// --- Play Button Icon ---
const PlayButton: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
    }}
  >
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: `${size * 0.25}px solid transparent`,
        borderBottom: `${size * 0.25}px solid transparent`,
        borderLeft: `${size * 0.4}px solid #000`,
        marginLeft: size * 0.08,
      }}
    />
  </div>
);

// --- Style Configurations ---
const STYLES = {
  bold: {
    textColor: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 20,
    fontSize: 72,
    fontWeight: 900,
    gradient: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)",
    glow: false,
  },
  minimal: {
    textColor: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 12,
    fontSize: 56,
    fontWeight: 800,
    gradient: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8) 100%)",
    glow: false,
  },
  neon: {
    textColor: "#39E508",
    strokeColor: "#000000",
    strokeWidth: 16,
    fontSize: 64,
    fontWeight: 900,
    gradient: "linear-gradient(180deg, rgba(0,0,30,0.3) 0%, rgba(0,0,0,0.85) 100%)",
    glow: true,
  },
};

// ============================================
// THUMBNAIL COMPONENT (1 frame static image)
// ============================================
export const Thumbnail: React.FC<ThumbnailProps> = ({
  backgroundUrl,
  hookText,
  title,
  showPlayButton = true,
  style = "bold",
}) => {
  const { width, height } = useVideoConfig();
  const config = STYLES[style];

  // Truncate text if too long
  const displayText = hookText.length > 50 ? hookText.slice(0, 50) + "..." : hookText;
  const displayTitle = title && title.length > 30 ? title.slice(0, 30) + "..." : title;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Background Image (blurred) - Note: Video URLs can't be used as Img src */}
      {/* For video backgrounds, we show a gradient fallback */}
      {backgroundUrl && !backgroundUrl.includes(".mp4") && (
        <AbsoluteFill>
          <Img
            src={backgroundUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(8px) brightness(0.6)",
              transform: "scale(1.1)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* Fallback gradient if no background or video URL */}
      {(!backgroundUrl || backgroundUrl.includes(".mp4")) && (
        <AbsoluteFill
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          }}
        />
      )}

      {/* Overlay gradient */}
      <AbsoluteFill style={{ background: config.gradient }} />

      {/* Content Container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 48,
          gap: 32,
        }}
      >
        {/* Play Button */}
        {showPlayButton && (
          <div style={{ marginBottom: 20 }}>
            <PlayButton size={100} />
          </div>
        )}

        {/* Hook Text (Main) */}
        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          {/* Stroke layer */}
          <h1
            style={{
              position: "absolute",
              fontSize: config.fontSize,
              fontWeight: config.fontWeight,
              fontFamily: "system-ui, -apple-system, sans-serif",
              textTransform: "uppercase",
              color: config.textColor,
              WebkitTextStroke: `${config.strokeWidth}px ${config.strokeColor}`,
              paintOrder: "stroke",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              wordBreak: "break-word",
            }}
          >
            {displayText}
          </h1>

          {/* Main text */}
          <h1
            style={{
              position: "relative",
              fontSize: config.fontSize,
              fontWeight: config.fontWeight,
              fontFamily: "system-ui, -apple-system, sans-serif",
              textTransform: "uppercase",
              color: config.textColor,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              wordBreak: "break-word",
              textShadow: config.glow
                ? `0 0 30px ${config.textColor}, 0 0 60px ${config.textColor}50`
                : "none",
            }}
          >
            {displayText}
          </h1>
        </div>

        {/* Title (Secondary) */}
        {displayTitle && (
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              fontFamily: "monospace",
              color: "rgba(255, 255, 255, 0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: 0,
              textAlign: "center",
            }}
          >
            {displayTitle}
          </p>
        )}
      </AbsoluteFill>

      {/* Corner branding */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontFamily: "monospace",
            color: "rgba(255, 255, 255, 0.3)",
            letterSpacing: "0.3em",
          }}
        >
          TRENDSYNTHESIS
        </p>
      </div>

      {/* Engagement indicators (optional) */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          display: "flex",
          gap: 16,
        }}
      >
        <span
          style={{
            padding: "6px 12px",
            backgroundColor: "rgba(255, 0, 0, 0.9)",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          VIRAL
        </span>
      </div>
    </AbsoluteFill>
  );
};

// Default export for Remotion composition
export default Thumbnail;
