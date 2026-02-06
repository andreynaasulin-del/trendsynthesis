"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Sparkles,
  User,
  Bot,
  ArrowRight,
  Eye,
  Target,
  BarChart2,
  Lock,
  Clapperboard,
  Briefcase,
  History,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StrategyOption } from "@/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useGenerationStore } from "@/stores/generation-store";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ThinkingIndicator } from "./ThinkingIndicator";

export type { StrategyOption };

// ============================================
// TYPES
// ============================================
type ChatMode = "creator" | "business";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
}

interface ViralChatProps {
  initialMessage?: string;
  onStrategySelect?: (strategy: StrategyOption) => void;
  className?: string;
}

// ============================================
// MODE CONFIG
// ============================================
const MODE_CONFIG = {
  creator: {
    icon: Clapperboard,
    label: { en: "Creator", ru: "Креатор" },
    description: { en: "Scripts & Viral Hooks", ru: "Скрипты и хуки" },
    greeting: {
      en: "Ready to engineer viral content. What's your niche?",
      ru: "Готов создать вирусный контент. Какая у вас ниша?",
    },
    aiName: "AI Architect",
    bgGradient: "from-violet-900/20 via-purple-900/10 to-zinc-950",
  },
  business: {
    icon: Briefcase,
    label: { en: "Business", ru: "Бизнес" },
    description: { en: "Strategy & Monetization", ru: "Стратегия и монетизация" },
    greeting: {
      en: "Business Architect ready. Tell me about your business.",
      ru: "Бизнес-Архитектор готов. Расскажите о вашем бизнесе.",
    },
    aiName: "Business Architect",
    bgGradient: "from-amber-900/15 via-orange-900/10 to-slate-950",
  },
};

// ============================================
// ICONS
// ============================================
const STRATEGY_ICONS: Record<string, React.ElementType> = {
  fear: Lock,
  hype: TrendingUp,
  value: Zap,
  insider: Eye,
  story: Target,
  default: Sparkles,
};

// ============================================
// AVATAR COMPONENT
// ============================================
const Avatar = ({ role, mode }: { role: "user" | "ai"; mode: ChatMode }) => (
  <div
    className={cn(
      "relative shrink-0 h-7 w-7 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border transition-all",
      role === "ai"
        ? cn(
          "bg-zinc-900/80 backdrop-blur-sm text-zinc-400",
          mode === "creator" ? "border-violet-500/40" : "border-amber-500/40"
        )
        : "bg-white border-white text-black shadow-lg shadow-white/10"
    )}
  >
    {role === "ai" ? <Bot className="h-4 w-4 sm:h-5 sm:w-5" /> : <User className="h-4 w-4 sm:h-5 sm:w-5" />}
  </div>
);

// ============================================
// MODE TOGGLE
// ============================================
const ModeToggle = ({
  mode,
  onModeChange,
  language,
}: {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  language: "en" | "ru";
}) => {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-zinc-900/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-zinc-800">
      {(["creator", "business"] as ChatMode[]).map((m) => {
        const config = MODE_CONFIG[m];
        const Icon = config.icon;
        const isActive = mode === m;

        return (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={cn(
              "flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-[10px] sm:text-xs font-medium transition-all relative",
              isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            )}
            title={config.description[language]}
          >
            {isActive && (
              <div
                className={cn(
                  "absolute inset-0 rounded-md",
                  m === "creator" ? "bg-violet-600" : "bg-amber-600"
                )}
              />
            )}
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 relative z-10" />
            <span className="hidden sm:inline relative z-10">{config.label[language]}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// STRATEGY CARD
// ============================================
const StrategyCard = ({
  option,
  onSelect,
  index,
}: {
  option: StrategyOption;
  onSelect: (s: StrategyOption) => void;
  index: number;
}) => {
  let Icon = STRATEGY_ICONS.default;
  const lowerTitle = option.title.toLowerCase();

  if (lowerTitle.includes("fear") || lowerTitle.includes("risk") || lowerTitle.includes("страх") || lowerTitle.includes("риск"))
    Icon = STRATEGY_ICONS.fear;
  else if (lowerTitle.includes("trend") || lowerTitle.includes("viral") || lowerTitle.includes("тренд"))
    Icon = STRATEGY_ICONS.hype;
  else if (lowerTitle.includes("value") || lowerTitle.includes("hack") || lowerTitle.includes("польз"))
    Icon = STRATEGY_ICONS.value;
  else if (lowerTitle.includes("insider") || lowerTitle.includes("secret") || lowerTitle.includes("секрет"))
    Icon = STRATEGY_ICONS.insider;
  else if (lowerTitle.includes("story") || lowerTitle.includes("journey") || lowerTitle.includes("истори"))
    Icon = STRATEGY_ICONS.story;

  return (
    <div
      onClick={() => onSelect(option)}
      className="group cursor-pointer rounded-lg sm:rounded-xl border border-violet-500/20 bg-zinc-900/60 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-violet-500/40 active:scale-[0.98] transition-all duration-200 p-3 sm:p-5 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        {option.confidence && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-zinc-800/50 border border-zinc-700/50">
            <BarChart2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-zinc-500" />
            <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400">{option.confidence}%</span>
          </div>
        )}
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-zinc-100 mb-1.5 sm:mb-2 group-hover:text-white transition-colors line-clamp-2">
        {option.title}
      </h3>

      <p className="text-xs sm:text-sm text-zinc-500 mb-3 sm:mb-5 line-clamp-2 leading-relaxed">
        {option.description}
      </p>

      <div className="mt-auto pt-2 sm:pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-violet-400/70 font-mono mb-1 sm:mb-2">
          <span className="uppercase tracking-wider">Hook</span>
        </div>
        <p className="text-xs sm:text-sm italic text-zinc-300 font-medium leading-relaxed line-clamp-2">"{option.hook_text}"</p>
      </div>

      <div className="mt-2 sm:mt-4 flex items-center justify-between">
        <span className="text-[10px] sm:text-xs text-zinc-500 font-mono">{option.estimated_views || "High"}</span>
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-400" />
      </div>
    </div>
  );
};

// ============================================
// CUSTOM SCRIPT CARD
// ============================================
interface CustomScript {
  mode: "custom";
  title: string;
  scenes: { id: number; timing: string; visual: string; text_overlay: string; transition?: string }[];
  style: string;
  total_duration: number;
}

const CustomScriptCard = ({
  script,
  onSelect,
  language,
}: {
  script: CustomScript;
  onSelect: () => void;
  language: "en" | "ru";
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-4"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-px bg-emerald-500/30 w-8" />
        <span className="text-[10px] uppercase tracking-widest text-emerald-400/70">
          {language === "ru" ? "Ваш Сценарий" : "Your Script"}
        </span>
        <div className="h-px bg-emerald-500/30 flex-1" />
      </div>

      <div
        onClick={onSelect}
        className="group cursor-pointer rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-all duration-200 p-4 sm:p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-white mb-1">{script.title}</h3>
            <p className="text-xs text-zinc-400">
              {script.scenes.length} {language === "ru" ? "сцен" : "scenes"} · {script.total_duration}s · {script.style}
            </p>
          </div>
          <div className="px-2 py-1 bg-emerald-500/20 rounded text-emerald-400 text-[10px] font-bold">
            CUSTOM
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {script.scenes.slice(0, 3).map((scene) => (
            <div key={scene.id} className="flex gap-2 text-xs">
              <span className="text-emerald-400 font-mono shrink-0">{scene.timing}</span>
              <span className="text-zinc-400 truncate">{scene.text_overlay || scene.visual}</span>
            </div>
          ))}
          {script.scenes.length > 3 && (
            <p className="text-[10px] text-zinc-500">+{script.scenes.length - 3} more...</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-black rounded-lg font-bold text-sm group-hover:bg-emerald-400 transition-colors">
          <Zap className="h-4 w-4" />
          {language === "ru" ? "Сгенерировать по этому сценарию" : "Generate from this script"}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MESSAGE BUBBLE (PREMIUM)
// ============================================
const MessageBubble = ({
  message,
  onStrategySelect,
  onCustomScriptSelect,
  mode,
  language,
}: {
  message: Message;
  onStrategySelect?: (s: StrategyOption) => void;
  onCustomScriptSelect?: (script: CustomScript) => void;
  mode: ChatMode;
  language: "en" | "ru";
}) => {
  const isUser = message.role === "user";
  const config = MODE_CONFIG[mode];

  // --- SMART PARSER ---
  let visibleText = message.content;
  let strategies: StrategyOption[] = [];
  let customScript: CustomScript | null = null;

  // Check for custom_script first (user's detailed script)
  const customScriptMatch = message.content.match(/<custom_script>([\s\S]*?)<\/custom_script>/);
  if (customScriptMatch && customScriptMatch[1] && mode === "creator") {
    visibleText = message.content.slice(0, message.content.indexOf("<custom_script>")).trim();
    try {
      customScript = JSON.parse(customScriptMatch[1]);
    } catch (e) {
      // Wait for full stream
    }
  }

  // Check for options (AI-generated strategies)
  const splitIndex = message.content.indexOf("<options>");
  if (splitIndex !== -1 && mode === "creator" && !customScript) {
    visibleText = message.content.slice(0, splitIndex).trim();

    const optionsContent = message.content.slice(splitIndex);
    const match = optionsContent.match(/<options>([\s\S]*?)<\/options>/);
    if (match && match[1]) {
      try {
        strategies = JSON.parse(match[1]);
      } catch (e) {
        // Wait for full stream
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex w-full gap-2 sm:gap-4 md:gap-5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <Avatar role="ai" mode={mode} />}

      <div className={cn("max-w-[90%] sm:max-w-[85%] md:max-w-[75%] flex flex-col gap-1.5 sm:gap-2", isUser && "items-end")}>
        {/* Label */}
        <div className="flex items-center gap-2 px-1">
          <span
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider",
              isUser ? "text-zinc-500" : mode === "creator" ? "text-violet-400/70" : "text-amber-400/70"
            )}
          >
            {isUser ? "You" : config.aiName}
          </span>
        </div>

        {/* Content Bubble */}
        {visibleText && (
          <div
            className={cn(
              "rounded-2xl text-sm sm:text-base leading-relaxed break-words",
              isUser
                ? "bg-white text-black rounded-tr-none px-3 py-2.5 sm:px-5 sm:py-4 shadow-lg shadow-white/5"
                : cn(
                  // Glassmorphism for AI messages
                  "backdrop-blur-sm border px-3 py-2.5 sm:px-5 sm:py-4 rounded-tl-none",
                  mode === "creator"
                    ? "bg-violet-500/5 border-violet-500/20 text-zinc-200"
                    : "bg-amber-500/5 border-amber-500/20 text-zinc-200"
                )
            )}
          >
            {isUser ? (
              // User messages - plain text
              <p className="whitespace-pre-wrap">{visibleText}</p>
            ) : (
              // AI messages - markdown rendered
              <MarkdownRenderer content={visibleText} mode={mode} />
            )}
          </div>
        )}

        {/* Custom Script Card (User's detailed script) */}
        {!isUser && customScript && mode === "creator" && (
          <CustomScriptCard
            script={customScript}
            onSelect={() => {
              if (onCustomScriptSelect) {
                onCustomScriptSelect(customScript);
              }
            }}
            language={language}
          />
        )}

        {/* Strategy Cards (AI-generated, only when no custom script) */}
        {!isUser && strategies.length > 0 && !customScript && mode === "creator" && (
          <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-px bg-violet-500/30 w-8" />
              <span className="text-[10px] uppercase tracking-widest text-violet-400/70">
                {language === "ru" ? "Предложенные стратегии" : "Proposed Strategies"}
              </span>
              <div className="h-px bg-violet-500/30 flex-1" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
              {strategies.map((strategy, idx) => (
                <StrategyCard
                  key={strategy.id || idx}
                  option={strategy}
                  onSelect={onStrategySelect || (() => { })}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && <Avatar role="user" mode={mode} />}
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
// ============================================
// QUERY HISTORY COMPONENT
// ============================================
interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  mode: ChatMode;
}

const HISTORY_KEY = "trendsynthesis_query_history";
const MAX_HISTORY = 10;

const QueryHistory: React.FC<{
  history: QueryHistoryItem[];
  onSelect: (query: string) => void;
  onClear: () => void;
  language: "en" | "ru";
  mode: ChatMode;
}> = ({ history, onSelect, onClear, language, mode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredHistory = history.filter(h => h.mode === mode).slice(0, 5);

  if (filteredHistory.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all border",
          mode === "creator"
            ? "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
            : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        )}
      >
        <History className="h-3 w-3" />
        <span>{language === "ru" ? "История" : "History"}</span>
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 w-64 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {language === "ru" ? "Последние запросы" : "Recent queries"}
              </span>
              <button
                onClick={() => { onClear(); setIsOpen(false); }}
                className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
              >
                {language === "ru" ? "Очистить" : "Clear"}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item.query); setIsOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                >
                  <p className="truncate">{item.query}</p>
                  <p className="text-[9px] text-zinc-600 mt-0.5">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export function ViralChat({ initialMessage, onStrategySelect, className }: ViralChatProps) {
  const { language, setLanguage } = useLanguage();
  const setStoreLanguage = useGenerationStore((state) => state.setLanguage);

  const [mode, setMode] = useState<ChatMode>("creator");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setQueryHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load query history");
    }
  }, []);

  // Save query to history
  const saveToHistory = (query: string) => {
    const newItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: Date.now(),
      mode,
    };
    setQueryHistory(prev => {
      const updated = [newItem, ...prev.filter(h => h.query !== query)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  // Clear history
  const clearHistory = () => {
    setQueryHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) { }
  };

  // Select from history
  const handleHistorySelect = (query: string) => {
    setInputValue(query);
    inputRef.current?.focus();
  };

  // Initialize with greeting
  useEffect(() => {
    setIsMounted(true);
    const config = MODE_CONFIG[mode];
    setMessages([
      {
        id: "init",
        role: "ai",
        content: config.greeting[language],
        timestamp: Date.now(),
      },
    ]);
  }, [language, mode]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isTyping]);

  // Handle mode change
  const handleModeChange = (newMode: ChatMode) => {
    if (newMode === mode) return;

    setMode(newMode);
    const config = MODE_CONFIG[newMode];

    // Reset conversation with new greeting
    setMessages([
      {
        id: "init-" + Date.now(),
        role: "ai",
        content: config.greeting[language],
        timestamp: Date.now(),
      },
    ]);

    // For business mode, trigger cold start greeting from API
    if (newMode === "business") {
      fetchBusinessGreeting();
    }
  };

  // Fetch business cold start greeting
  const fetchBusinessGreeting = async () => {
    setIsTyping(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          mode: "business",
          messages: [],
        }),
      });

      if (!response.ok || !response.body) throw new Error("Failed to get greeting");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let greeting = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          greeting += decoder.decode(value, { stream: true });
        }
      }

      setMessages([
        {
          id: "business-init-" + Date.now(),
          role: "ai",
          content: greeting,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch business greeting:", error);
    } finally {
      setIsTyping(false);
    }
  };




  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();

    // INTENT DETECTION: If user says "start" or "generate", check context
    if (
      /start|generate|create|поехали|начинай|генерация/i.test(queryText) &&
      mode === "creator"
    ) {
      // Find the last AI message with strategies
      const lastAiMsg = [...messages].reverse().find(m => m.role === "ai" && m.content.includes("<options>"));
      if (lastAiMsg) {
        const match = lastAiMsg.content.match(/<options>([\s\S]*?)<\/options>/);
        if (match && match[1]) {
          try {
            const options: StrategyOption[] = JSON.parse(match[1]);
            const bestStrategy = options[0]; // Take the first/best match
            if (bestStrategy && onStrategySelect) {
              setInputValue("");
              // Emulate user message
              setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "user",
                content: queryText,
                timestamp: Date.now()
              }]);

              // Trigger pipeline directly
              setTimeout(() => onStrategySelect(bestStrategy), 500);
              return;
            }
          } catch (e) {
            console.error("Failed to parse previous strategy context", e);
          }
        }
      }
    }

    // Save to history
    saveToHistory(queryText);

    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: queryText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          mode,
          messages: messages.concat(newMsg).map((m) => ({
            role: m.role === "ai" ? "assistant" : m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Network Error");
      if (!response.body) throw new Error("No response");

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMsgId, role: "ai", content: "", timestamp: Date.now() }]);
      setIsTyping(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          accumContent += chunkValue;
          setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: accumContent } : m)));
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content: `Error: ${error.message || "Connection failed."}`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isMounted) return null;

  const config = MODE_CONFIG[mode];

  return (
    <div
      className={cn(
        "flex flex-col w-full h-[80vh] md:h-[750px] overflow-hidden rounded-xl border",
        mode === "creator" ? "border-violet-500/20" : "border-amber-500/20",
        className
      )}
    >
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={cn("absolute inset-0 bg-gradient-to-br -z-10", config.bgGradient)}
        />
      </AnimatePresence>

      {/* Header - Mobile Optimized */}
      <div
        className={cn(
          "flex items-center justify-between border-b px-3 py-2.5 sm:px-5 sm:py-4 backdrop-blur-sm shrink-0",
          mode === "creator"
            ? "border-violet-500/20 bg-violet-500/5"
            : "border-amber-500/20 bg-amber-500/5"
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              "h-7 w-7 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center shadow-lg shrink-0",
              mode === "creator" ? "bg-violet-600 shadow-violet-500/20" : "bg-amber-600 shadow-amber-500/20"
            )}
          >
            {mode === "creator" ? (
              <Clapperboard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            ) : (
              <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            )}
          </div>
          <div className="hidden sm:block">
            <h3 className="text-sm font-semibold text-white">{config.aiName}</h3>
            <p className="text-xs text-zinc-500">{config.description[language]}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mode Toggle */}
          <ModeToggle mode={mode} onModeChange={handleModeChange} language={language} />

          {/* Language Toggle */}
          <div className="flex items-center bg-zinc-900/80 backdrop-blur-sm rounded-md sm:rounded-lg border border-zinc-800 p-0.5 sm:p-1">
            {(["en", "ru"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setStoreLanguage(lang);
                }}
                className={cn(
                  "px-2 py-1 sm:px-2.5 sm:py-1.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded transition-all",
                  language === lang ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Area - Mobile Optimized */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent bg-zinc-950/80"
        ref={scrollRef}
      >
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto pb-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onStrategySelect={onStrategySelect}
                onCustomScriptSelect={(script) => {
                  // Convert custom script to strategy format and trigger pipeline
                  if (onStrategySelect) {
                    onStrategySelect({
                      id: "custom-" + Date.now(),
                      title: script.title,
                      hook_text: script.scenes[0]?.text_overlay || script.title,
                      description: `Custom script with ${script.scenes.length} scenes`,
                      confidence: 100,
                      estimated_views: "Custom",
                      // Pass full script data
                      customScript: script,
                    } as StrategyOption & { customScript: typeof script });
                  }
                }}
                mode={mode}
                language={language}
              />
            ))}
          </AnimatePresence>
          {isTyping && <ThinkingIndicator mode={mode} language={language} />}
        </div>
      </div>

      {/* Input Area - Mobile Optimized */}
      <div
        className={cn(
          "p-3 sm:p-5 border-t backdrop-blur-sm shrink-0",
          mode === "creator" ? "bg-violet-500/5 border-violet-500/20" : "bg-amber-500/5 border-amber-500/20"
        )}
      >
        <div className="max-w-4xl mx-auto relative flex items-center gap-2 sm:gap-3">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "creator"
                ? language === "en"
                  ? "Describe your niche..."
                  : "Опишите нишу..."
                : language === "en"
                  ? "Ask about strategy..."
                  : "Спросите о стратегии..."
            }
            className={cn(
              "flex-1 bg-zinc-900/80 backdrop-blur-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none transition-all font-light border",
              mode === "creator"
                ? "border-violet-500/30 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                : "border-amber-500/30 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
            )}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              "transition-all h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl disabled:opacity-50 shadow-lg shrink-0",
              mode === "creator"
                ? "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/20"
                : "bg-amber-600 text-white hover:bg-amber-500 shadow-amber-500/20"
            )}
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        {/* History & Mode indicator - Hidden on small mobile */}
        <div className="max-w-4xl mx-auto flex items-center justify-between mt-2 sm:mt-3">
          <QueryHistory
            history={queryHistory}
            onSelect={handleHistorySelect}
            onClear={clearHistory}
            language={language}
            mode={mode}
          />
          <p className="hidden sm:block text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            {mode === "creator"
              ? language === "en"
                ? "Creator Mode"
                : "Режим Креатора"
              : language === "en"
                ? "Business Mode"
                : "Бизнес Режим"}
          </p>
        </div>
      </div>
    </div>
  );
}
