"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Check,
  X,
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Scenario, MontageComposition } from "@/types";

// --- Tone Badge Colors (Minimal) ---
const TONE_COLORS: Record<string, string> = {
  professional: "text-zinc-400 bg-zinc-800/50 border-zinc-700",
  casual: "text-zinc-400 bg-zinc-800/50 border-zinc-700",
  provocative: "text-zinc-300 bg-zinc-800 border-zinc-600",
  educational: "text-zinc-400 bg-zinc-800/50 border-zinc-700",
  emotional: "text-zinc-400 bg-zinc-800/50 border-zinc-700",
};

// --- Single Scenario Card ---
function ScenarioCard({
  scenario,
  index,
  isSelected,
  hasComposition,
  onToggle,
  onPreview,
  language,
}: {
  scenario: Scenario;
  index: number;
  isSelected: boolean;
  hasComposition: boolean;
  onToggle: () => void;
  onPreview: () => void;
  language: "en" | "ru";
}) {
  const toneClass = TONE_COLORS[scenario.tone] || TONE_COLORS.casual;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border p-4 transition-all cursor-pointer",
        isSelected
          ? "border-zinc-500 bg-zinc-900 shadow-sm"
          : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
      )}
      onClick={onToggle}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Selection Indicator */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={cn(
              "shrink-0 h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
              isSelected
                ? "bg-white border-white text-black"
                : "border-zinc-600 hover:border-zinc-400 bg-transparent"
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              Scenario {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Tone Badge */}
        <span
          className={cn(
            "text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border",
            toneClass
          )}
        >
          {scenario.tone}
        </span>
      </div>

      {/* Content */}
      <h4 className="text-sm font-medium text-zinc-200 leading-snug line-clamp-2">
        {scenario.title}
      </h4>

      {/* Hook */}
      <div className="pl-3 border-l-2 border-zinc-800">
        <p className="text-xs text-zinc-400 line-clamp-2 italic">
          "{scenario.hook}"
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-zinc-800/50">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Clock className="h-3 w-3" />
          <span className="text-[10px]">{scenario.duration_seconds}s</span>
        </div>

        {/* Preview Button */}
        {hasComposition && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            <Play className="h-3 w-3 fill-current" />
            {language === "ru" ? "Превью" : "Preview"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// --- Gallery Props ---
interface ScenarioGalleryProps {
  scenarios: Scenario[];
  compositions: MontageComposition[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onPreview: (compositionIndex: number) => void;
  language: "en" | "ru";
}

// --- Main Gallery Component ---
export function ScenarioGallery({
  scenarios,
  compositions,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onPreview,
  language,
}: ScenarioGalleryProps) {
  const compositionMap = new Map(
    compositions.map((c, i) => [c.scenario.id, i])
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-white">Generated Scenarios</h3>
          <span className="text-xs text-zinc-500">
            {language === "ru"
              ? `${scenarios.length} найдено · ${selectedIds.size} выбрано`
              : `${scenarios.length} found · ${selectedIds.size} selected`}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-zinc-800 hover:bg-zinc-800 hover:text-white bg-transparent"
            onClick={onSelectAll}
          >
            {language === "ru" ? "Выбрать все" : "Select All"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-zinc-500 hover:text-white"
            onClick={onDeselectAll}
          >
            {language === "ru" ? "Сброс" : "Clear"}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-zinc-800 flex-1">
        {scenarios.map((scenario, idx) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            index={idx}
            isSelected={selectedIds.has(scenario.id)}
            hasComposition={compositionMap.has(scenario.id)}
            onToggle={() => onToggle(scenario.id)}
            onPreview={() => {
              const compIdx = compositionMap.get(scenario.id);
              if (compIdx !== undefined) onPreview(compIdx);
            }}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}
