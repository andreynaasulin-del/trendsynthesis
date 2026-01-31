"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Zap,
  Clock,
  Hash,
  Sparkles,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Scenario, MontageComposition } from "@/types";

// --- Tone Badge Colors ---
const TONE_COLORS: Record<string, string> = {
  professional: "text-blue-400 border-blue-400/30 bg-blue-400/5",
  casual: "text-green-400 border-green-400/30 bg-green-400/5",
  provocative: "text-red-400 border-red-400/30 bg-red-400/5",
  educational: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  emotional: "text-purple-400 border-purple-400/30 bg-purple-400/5",
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
        "group relative flex flex-col gap-2 rounded-lg border p-3 transition-all cursor-pointer",
        isSelected
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
      )}
      onClick={onToggle}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Selection Indicator */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="shrink-0"
          >
            {isSelected ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <Circle className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400" />
            )}
          </button>

          {/* Index */}
          <span className="text-[10px] font-mono text-zinc-600 shrink-0">
            #{index + 1}
          </span>

          {/* Tone Badge */}
          <span
            className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded border",
              toneClass
            )}
          >
            {scenario.tone.toUpperCase()}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 text-zinc-600 shrink-0">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-mono">{scenario.duration_seconds}s</span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-zinc-200 leading-snug line-clamp-2">
        {scenario.title}
      </h4>

      {/* Hook */}
      <div className="rounded bg-black/30 border border-zinc-800 px-2 py-1.5">
        <p className="text-[10px] font-mono text-primary/80 line-clamp-2">
          &gt; {scenario.hook}
        </p>
      </div>

      {/* Keywords */}
      {scenario.keywords && scenario.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {scenario.keywords.slice(0, 3).map((kw, i) => (
            <span
              key={i}
              className="text-[9px] font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Preview Button (only if composition exists) */}
      {hasComposition && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="mt-1 flex items-center justify-center gap-1 rounded bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] font-mono text-primary hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          {language === "ru" ? "ПРЕВЬЮ" : "PREVIEW"}
        </button>
      )}
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
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-mono text-zinc-400">
            {language === "ru"
              ? `${scenarios.length} сценариев · ${selectedIds.size} выбрано`
              : `${scenarios.length} scenarios · ${selectedIds.size} selected`}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] font-mono px-2 gap-1"
            onClick={onSelectAll}
          >
            <CheckCheck className="h-3 w-3" />
            {language === "ru" ? "ВСЕ" : "ALL"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] font-mono px-2 gap-1"
            onClick={onDeselectAll}
          >
            <XCircle className="h-3 w-3" />
            {language === "ru" ? "СБРОС" : "NONE"}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
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
