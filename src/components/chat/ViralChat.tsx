"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Zap,
  Skull,
  TrendingUp,
  Sparkles,
  User,
  Globe,
  Bot,
  ArrowRight,
  Signal,
  Activity,
  Shield,
  Eye,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StrategyOption } from "@/types";

// Re-export for backward compatibility
export type { StrategyOption };

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

// --- Icons Map ---
const STRATEGY_ICONS: Record<string, React.ElementType> = {
  fear: Skull,
  hype: TrendingUp,
  value: Zap,
  insider: Eye,
  story: Target,
  default: Sparkles,
};

// --- Animated Gradient Border ---
const GradientBorder = () => (
  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        padding: "1px",
        background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.1), rgba(139,92,246,0.05), rgba(236,72,153,0.15), rgba(139,92,246,0.3))",
        backgroundSize: "300% 300%",
        animation: "gradient-shift 8s ease infinite",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  </div>
);

// --- AI Avatar Component ---
const AIAvatar = ({ isTyping }: { isTyping?: boolean }) => (
  <div className="relative shrink-0">
    {/* Outer glow ring */}
    <div className={cn(
      "absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500/40 via-blue-500/30 to-violet-500/40 blur-sm transition-opacity duration-700",
      isTyping ? "opacity-100 animate-pulse" : "opacity-40"
    )} />
    {/* Avatar body */}
    <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 flex items-center justify-center shadow-lg shadow-violet-500/10">
      <Bot className={cn(
        "h-4 w-4 transition-colors duration-500",
        isTyping ? "text-violet-400" : "text-zinc-400"
      )} />
      {/* Status dot */}
      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900">
        <div className={cn(
          "h-full w-full rounded-full",
          isTyping ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
        )} />
      </div>
    </div>
  </div>
);

// --- User Avatar ---
const UserAvatar = () => (
  <div className="relative shrink-0">
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
      <User className="h-4 w-4 text-white" />
    </div>
  </div>
);

// --- Shimmer Effect for Cards ---
const ShimmerOverlay = () => (
  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
    <div
      className="absolute inset-0 -translate-x-full animate-shimmer"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
      }}
    />
  </div>
);

// --- Strategy Card V2 (Premium) ---
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
  else if (lowerTitle.includes("value") || lowerTitle.includes("hack") || lowerTitle.includes("ценност"))
    Icon = STRATEGY_ICONS.value;
  else if (lowerTitle.includes("insider") || lowerTitle.includes("secret") || lowerTitle.includes("секрет"))
    Icon = STRATEGY_ICONS.insider;
  else if (lowerTitle.includes("story") || lowerTitle.includes("journey") || lowerTitle.includes("истори"))
    Icon = STRATEGY_ICONS.story;

  // Gradient accents per card
  const gradients = [
    "from-violet-500/10 to-blue-500/5",
    "from-emerald-500/10 to-cyan-500/5",
    "from-rose-500/10 to-orange-500/5",
  ];
  const borderGradients = [
    "hover:border-violet-500/30",
    "hover:border-emerald-500/30",
    "hover:border-rose-500/30",
  ];
  const iconColors = [
    "group-hover:text-violet-400",
    "group-hover:text-emerald-400",
    "group-hover:text-rose-400",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6 + index * 0.12, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(option)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl transition-all duration-300",
        borderGradients[index % 3],
        "hover:shadow-2xl hover:shadow-violet-500/5"
      )}
    >
      <ShimmerOverlay />

      {/* Top gradient accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        gradients[index % 3]
      )} />

      <div className="relative z-10 p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] transition-all duration-300 group-hover:bg-white/[0.06]"
            )}>
              <Icon className={cn("h-3.5 w-3.5 text-zinc-500 transition-colors", iconColors[index % 3])} />
            </div>
            <div>
              <span className="text-[9px] font-mono text-zinc-600 tracking-wider">
                STRATEGY #{index + 1}
              </span>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-zinc-200 group-hover:text-white transition-colors leading-tight">
          {option.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {option.description}
        </p>


        {/* Metrics (New V2 Feature) */}
        <div className="flex items-center gap-2 mb-2">
          {option.confidence && (
            <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
              <span className="font-bold">{option.confidence}%</span>
              <span className="opacity-70">CONFIDENCE</span>
            </div>
          )}
          {option.estimated_views && (
            <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-blue-400 border border-blue-500/20">
              <Eye className="h-2.5 w-2.5" />
              <span>{option.estimated_views}</span>
            </div>
          )}
        </div>

        {/* Hook Preview Low */}
        <div className="rounded-lg bg-black/50 border border-white/[0.04] p-2.5 mt-auto">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="h-2.5 w-2.5 text-violet-500/60" />
            <span className="text-[8px] font-mono text-violet-500/60 tracking-widest">HOOK_TEXT</span>
          </div>
          <p className="font-mono text-[10px] text-violet-300/80 leading-relaxed">
            &quot;{option.hook_text}&quot;
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// --- Typing Indicator V2 ---
const TypingIndicator = ({ language }: { language: "en" | "ru" }) => {
  const texts = useMemo(() =>
    language === "ru"
      ? ["АНАЛИЗ ТРЕНДОВ", "ГЕНЕРАЦИЯ СТРАТЕГИЙ", "ОБРАБОТКА ДАННЫХ", "ПОИСК ПАТТЕРНОВ"]
      : ["ANALYZING TRENDS", "GENERATING STRATEGIES", "PROCESSING DATA", "FINDING PATTERNS"],
    [language]
  );

  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIdx((prev) => (prev + 1) % texts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [texts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 px-1"
    >
      <AIAvatar isTyping />
      <div className="flex flex-col gap-2">
        <div className="rounded-2xl rounded-bl-sm bg-zinc-900/60 border border-white/[0.06] backdrop-blur-xl px-4 py-3">
          {/* Animated dots */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={textIdx}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="text-[10px] font-mono text-violet-400/70 tracking-wider"
              >
                {texts[textIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Message Bubble V2 (Premium) ---
const MessageBubble = ({
  message,
  onStrategySelect,
}: {
  message: Message;
  onStrategySelect?: (s: StrategyOption) => void;
}) => {
  const isUser = message.role === "user";

  // Parse options
  const optionsRegex = /<options>([\s\S]*?)<\/options>/;
  const match = message.content.match(optionsRegex);

  let rawText = message.content;
  let strategies: StrategyOption[] = [];

  if (match && match[1]) {
    try {
      rawText = message.content.replace(match[0], "").trim();
      // Force clean artifacts
      rawText = rawText.replace(/\*\*/g, "").replace(/—/g, "-").replace(/__/g, "");
      strategies = JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse hidden options:", e);
    }
  } else {
    // Clean even if no options found yet (streaming)
    rawText = rawText.replace(/\*\*/g, "").replace(/—/g, "-").replace(/__/g, "");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {/* AI Avatar */}
      {!isUser && <AIAvatar />}

      <div className={cn("max-w-[90%] md:max-w-[85%] flex flex-col gap-3", isUser && "items-end")}>
        {/* Timestamp + Label */}
        <div className={cn("flex items-center gap-2 px-1", isUser && "flex-row-reverse")}>
          <span className="text-[9px] font-mono text-zinc-600">
            {isUser ? "" : "TrendSynth AI"}
          </span>
          <span className="text-[9px] font-mono text-zinc-700">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Text Content */}
        {rawText && (
          <div
            className={cn(
              "rounded-2xl px-5 py-3.5 text-[13px] leading-[1.7] shadow-lg whitespace-pre-wrap break-words",
              isUser
                ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm shadow-violet-500/20"
                : "bg-zinc-900/70 border border-white/[0.06] text-zinc-300 rounded-bl-sm backdrop-blur-xl shadow-black/20"
            )}
          >
            {rawText.split("\n").map((line, i) => (
              <p key={i} className={cn("min-h-[1em]", i > 0 && "mt-1.5")}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Strategy Cards */}
        {!isUser && strategies.length > 0 && (
          <div className="w-full mt-2">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Shield className="h-3 w-3 text-violet-500/50" />
              <span className="text-[9px] font-mono text-violet-500/50 tracking-widest">
                VIRAL STRATEGIES
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {strategies.map((strategy, idx) => (
                <StrategyCard
                  key={strategy.id}
                  option={strategy}
                  onSelect={onStrategySelect || (() => { })}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && <UserAvatar />}
    </motion.div>
  );
};

// --- Animated Background Grid ---
const BackgroundGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Subtle dot grid */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    />
    {/* Top glow */}
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/[0.03] rounded-full blur-[100px]" />
    {/* Bottom glow */}
    <div className="absolute -bottom-24 left-1/4 w-[400px] h-[200px] bg-blue-600/[0.02] rounded-full blur-[80px]" />
  </div>
);

// ==========================================
// MAIN CHAT COMPONENT — V3 PREMIUM
// ==========================================
export function ViralChat({
  initialMessage,
  onStrategySelect,
  className,
}: ViralChatProps) {
  const [language, setLanguage] = useState<"en" | "ru">("en");

  const greeting = initialMessage || (language === "en"
    ? "Ready to engineer viral content. What's your niche?"
    : "Готов создать вирусный контент. Какая у вас ниша?");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      content: greeting,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Update greeting on language change
  useEffect(() => {
    if (messages.length <= 1 && messages[0].role === "ai") {
      setMessages([{
        id: "init",
        role: "ai",
        content: language === "en"
          ? "Ready to engineer viral content. What's your niche?"
          : "Готов создать вирусный контент. Какая у вас ниша?",
        timestamp: Date.now(),
      }]);
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
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
          messages: messages.concat(newMsg).map((m) => ({
            role: m.role === "ai" ? "assistant" : m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        let errorMessage = "Network Error";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Error ${response.status}`;
        } catch {
          if (response.status === 401) errorMessage = "API Key Invalid/Missing";
          else if (response.status === 500) errorMessage = "OpenAI Service Error";
        }
        throw new Error(errorMessage);
      }
      if (!response.body) throw new Error("No response body");

      const aiMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "ai", content: "", timestamp: Date.now() },
      ]);
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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: accumContent } : m
            )
          );
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
          content: `⚠ Error: ${error.message || "Connection lost. Please try again."}`,
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

  return (
    <>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      <div
        className={cn(
          "relative flex flex-col w-full max-w-5xl mx-auto overflow-hidden rounded-2xl",
          "h-[calc(100vh-1rem)] md:h-[700px]", // Mobile full height minus margin, Desktop fixed
          "bg-zinc-950/90 backdrop-blur-2xl shadow-2xl shadow-black/40",
          className
        )}
      >
        <GradientBorder />

        {/* ===== HEADER ===== */}
        <div className="relative flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/30 px-3 md:px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2 md:gap-3">
            {/* AI Identity */}
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-white/[0.06] flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-violet-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-zinc-300 tracking-wide">
                TrendSynth V2
              </span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-zinc-600">
                  {language === "ru" ? "AI-АРХИТЕКТОР" : "AI ARCHITECT"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Signal indicator - Hidden on very small screens */}
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <Signal className="h-3 w-3 text-emerald-500/60" />
              <span className="text-[9px] font-mono text-zinc-600">GPT-4o</span>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.06] bg-zinc-900/50 p-0.5">
              {(["en", "ru"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-200",
                    language === lang
                      ? "bg-violet-600/20 text-violet-300 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== MESSAGES AREA ===== */}
        <div className="flex-1 overflow-hidden relative">
          <BackgroundGrid />

          <div
            className="h-full overflow-y-auto px-3 md:px-5 py-4 md:py-6 relative z-10 scrollbar-thin scrollbar-thumb-zinc-800/50 scrollbar-track-transparent"
            ref={scrollRef}
          >
            <div className="flex flex-col gap-4 md:gap-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onStrategySelect={onStrategySelect}
                  />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isTyping && <TypingIndicator language={language} />}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ===== INPUT AREA ===== */}
        <div className="relative border-t border-white/[0.06] bg-zinc-900/20 px-3 md:px-4 py-3 backdrop-blur-xl safe-area-bottom">
          {/* Input glow on focus */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-px transition-opacity duration-300",
              isFocused ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)",
            }}
          />

          <div className="relative flex items-center gap-2">
            <div
              className={cn(
                "relative flex-1 rounded-xl border transition-all duration-200",
                isFocused
                  ? "border-violet-500/30 bg-zinc-900/80 shadow-lg shadow-violet-500/5"
                  : "border-white/[0.06] bg-zinc-900/50"
              )}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={
                  language === "en"
                    ? "Describe your video idea..."
                    : "Опишите идею видео..."
                }
                className="w-full h-11 px-4 pr-12 bg-transparent text-[14px] md:text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none font-light"
              // Increased font size to 16px equivalent (14px is minimum for inputs on some OS to avoid zoom) to prevent zoom on focus
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 md:h-7 md:w-7 rounded-lg transition-all duration-200",
                  inputValue.trim()
                    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                    : "bg-white/[0.03] text-zinc-600"
                )}
              >
                <Send className="h-4 w-4 md:h-3.5 md:w-3.5" />
              </Button>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-2 flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-zinc-700" />
              <span className="text-[9px] text-zinc-700 font-mono">
                {language === "en" ? "VIRAL_ENGINE_V3" : "ДВИЖОК_V3"}
              </span>
            </div>
            <span className="hidden md:block text-[9px] text-zinc-700 font-mono">
              ⏎ {language === "en" ? "to send" : "отправить"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
