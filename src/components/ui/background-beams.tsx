"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps {
  className?: string;
  children?: React.ReactNode;
}

export function BackgroundBeams({ className, children }: BackgroundBeamsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Animated gradient beams */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Primary beam */}
        <div
          className="absolute -top-[40%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
            animation: "pulse-beam 8s ease-in-out infinite",
          }}
        />

        {/* Secondary beam */}
        <div
          className="absolute -bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
            animation: "pulse-beam 10s ease-in-out infinite 2s",
          }}
        />

        {/* Accent beam */}
        <div
          className="absolute top-[30%] -left-[10%] h-[300px] w-[300px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
            animation: "pulse-beam 12s ease-in-out infinite 4s",
          }}
        />

        {/* Moving lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Diagonal lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={i}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10 + 50}%`}
              y2="100%"
              stroke="url(#beam-gradient)"
              strokeWidth="1"
              className="animate-beam-slide"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes pulse-beam {
          0%, 100% {
            transform: scale(1) translate(-50%, 0);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.2) translate(-50%, 0);
            opacity: 0.25;
          }
        }
        @keyframes beam-slide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translateX(20px);
          }
        }
      `}</style>
    </div>
  );
}

// Simpler variant for cards
export function GlowingBorder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("group relative", className)}>
      {/* Glow effect */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)",
        }}
      />
      {/* Content */}
      <div className="relative rounded-xl bg-zinc-950">{children}</div>
    </div>
  );
}
