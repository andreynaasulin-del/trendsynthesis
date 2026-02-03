"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bot, Sparkles, Brain, Target, Lightbulb, TrendingUp } from "lucide-react";

type ChatMode = "creator" | "business";

interface ThinkingIndicatorProps {
  mode: ChatMode;
  language: "en" | "ru";
}

// ============================================
// THINKING STEPS CONFIG
// ============================================
const THINKING_STEPS = {
  creator: {
    en: [
      { text: "Analyzing your niche...", icon: Brain },
      { text: "Identifying viral angles...", icon: Target },
      { text: "Crafting hook variations...", icon: Sparkles },
      { text: "Drafting strategy options...", icon: TrendingUp },
    ],
    ru: [
      { text: "Анализирую нишу...", icon: Brain },
      { text: "Ищу вирусные углы...", icon: Target },
      { text: "Создаю варианты хуков...", icon: Sparkles },
      { text: "Формирую стратегии...", icon: TrendingUp },
    ],
  },
  business: {
    en: [
      { text: "Analyzing business context...", icon: Brain },
      { text: "Identifying pain points...", icon: Target },
      { text: "Mapping funnel opportunities...", icon: Lightbulb },
      { text: "Drafting strategy...", icon: TrendingUp },
    ],
    ru: [
      { text: "Анализирую бизнес-контекст...", icon: Brain },
      { text: "Выявляю болевые точки...", icon: Target },
      { text: "Выстраиваю воронку...", icon: Lightbulb },
      { text: "Формирую стратегию...", icon: TrendingUp },
    ],
  },
};

// ============================================
// THINKING INDICATOR COMPONENT
// ============================================
export function ThinkingIndicator({ mode, language }: ThinkingIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = THINKING_STEPS[mode][language];

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-4"
    >
      {/* Avatar */}
      <div
        className={cn(
          "relative shrink-0 h-9 w-9 rounded-full flex items-center justify-center border",
          "bg-zinc-900",
          mode === "creator" ? "border-violet-500/40" : "border-amber-500/40"
        )}
      >
        <Bot className="h-5 w-5 text-zinc-400" />
        {/* Pulsing ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            mode === "creator" ? "bg-violet-500/20" : "bg-amber-500/20"
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Thinking Card */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-none",
          "backdrop-blur-sm border",
          mode === "creator"
            ? "bg-violet-500/10 border-violet-500/20"
            : "bg-amber-500/10 border-amber-500/20"
        )}
      >
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {/* Progress dots */}
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <motion.div
                key={idx}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                  idx === currentStep
                    ? mode === "creator"
                      ? "bg-violet-400"
                      : "bg-amber-400"
                    : idx < currentStep
                    ? mode === "creator"
                      ? "bg-violet-500/50"
                      : "bg-amber-500/50"
                    : "bg-zinc-700"
                )}
                animate={
                  idx === currentStep
                    ? {
                        scale: [1, 1.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </div>

        {/* Animated Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <Icon
              className={cn(
                "h-4 w-4",
                mode === "creator" ? "text-violet-400" : "text-amber-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                mode === "creator" ? "text-violet-200" : "text-amber-200"
              )}
            >
              {currentStepData.text}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Loading animation */}
        <div className="flex items-center gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={cn(
                "h-1 w-1 rounded-full",
                mode === "creator" ? "bg-violet-400" : "bg-amber-400"
              )}
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ThinkingIndicator;
