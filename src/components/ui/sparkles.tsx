"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  children: React.ReactNode;
  className?: string;
  sparkleColor?: string;
  sparkleCount?: number;
  minSize?: number;
  maxSize?: number;
}

interface Sparkle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
}

export function Sparkles({
  children,
  className,
  sparkleColor = "#FDE047", // Yellow
  sparkleCount = 10,
  minSize = 4,
  maxSize = 8,
}: SparklesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < sparkleCount; i++) {
        newSparkles.push({
          id: `sparkle-${i}-${Date.now()}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (maxSize - minSize) + minSize,
          opacity: Math.random() * 0.5 + 0.5,
          delay: Math.random() * 2,
        });
      }
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 3000);
    return () => clearInterval(interval);
  }, [sparkleCount, minSize, maxSize]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {sparkles.map((sparkle) => (
          <svg
            key={sparkle.id}
            className="absolute animate-sparkle"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: `${sparkle.delay}s`,
              opacity: sparkle.opacity,
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill={sparkleColor}
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

// SparklesButton - Button with integrated sparkles
interface SparklesButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  sparkleColor?: string;
  variant?: "default" | "glow";
}

export function SparklesButton({
  children,
  className,
  sparkleColor = "#FDE047",
  variant = "default",
  ...props
}: SparklesButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Sparkles
      sparkleColor={sparkleColor}
      sparkleCount={isHovered ? 15 : 8}
      className={cn(
        "transition-all duration-300",
        isHovered && "scale-[1.02]"
      )}
    >
      <button
        className={cn(
          "relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
          variant === "default" && [
            "bg-gradient-to-r from-violet-600 to-indigo-600",
            "text-white shadow-lg shadow-violet-500/25",
            "hover:shadow-xl hover:shadow-violet-500/40",
            "active:scale-[0.98]",
          ],
          variant === "glow" && [
            "bg-white text-black",
            "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
            "hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]",
          ],
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </button>
    </Sparkles>
  );
}
