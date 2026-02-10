"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-3 lg:grid-cols-4 lg:gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  // Size variants
  size?: "1x1" | "2x1" | "1x2" | "2x2";
  // Visual variants
  variant?: "default" | "featured" | "gradient" | "glass";
  // Background image/video
  backgroundUrl?: string;
  isVideo?: boolean;
}

export function BentoCard({
  title,
  description,
  icon,
  className,
  children,
  onClick,
  size = "1x1",
  variant = "default",
  backgroundUrl,
  isVideo = false,
}: BentoCardProps) {
  const sizeClasses = {
    "1x1": "",
    "2x1": "md:col-span-2",
    "1x2": "row-span-2",
    "2x2": "md:col-span-2 row-span-2",
  };

  const variantClasses = {
    default: "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700",
    featured: "bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border-violet-500/30 hover:border-violet-500/50",
    gradient: "bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800",
    glass: "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Background Media */}
      {backgroundUrl && (
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video
              src={backgroundUrl}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-50"
            />
          ) : (
            <div
              className="h-full w-full bg-cover bg-center opacity-30 transition-opacity group-hover:opacity-50"
              style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        {(icon || title) && (
          <div className="mb-2">
            {icon && (
              <div className="mb-2 inline-flex items-center justify-center rounded-lg bg-zinc-800/50 p-2 text-zinc-400 group-hover:bg-zinc-700/50 group-hover:text-white transition-colors">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-white line-clamp-1">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{description}</p>
            )}
          </div>
        )}

        {/* Custom children */}
        {children && <div className="flex-1 overflow-hidden">{children}</div>}
      </div>

      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div
          className="absolute -inset-[1px] rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))",
          }}
        />
      </div>
    </motion.div>
  );
}

// Skeleton for loading state
export function BentoCardSkeleton({ size = "1x1" }: { size?: BentoCardProps["size"] }) {
  const sizeClasses = {
    "1x1": "",
    "2x1": "md:col-span-2",
    "1x2": "row-span-2",
    "2x2": "md:col-span-2 row-span-2",
  };

  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50 p-4",
        sizeClasses[size]
      )}
    >
      <div className="mb-2 h-8 w-8 rounded-lg bg-zinc-800" />
      <div className="mb-2 h-4 w-3/4 rounded bg-zinc-800" />
      <div className="h-3 w-1/2 rounded bg-zinc-800" />
    </div>
  );
}
