"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Zap,
  TrendingUp,
  Sparkles,
  User,
  Bot,
  ArrowRight,
  Eye,
  Target,
  BarChart2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StrategyOption } from "@/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

// --- Icons Map (Minimal) ---
const STRATEGY_ICONS: Record<string, React.ElementType> = {
  fear: Lock,
  hype: TrendingUp,
  value: Zap,
  insider: Eye,
  story: Target,
  default: Sparkles,
};

// --- Avatar Component (Clean) ---
const Avatar = ({ role, isTyping }: { role: "user" | "ai"; isTyping?: boolean }) => (
  <div className={cn(
    "relative shrink-0 h-8 w-8 rounded-full flex items-center justify-center border transition-colors",
    role === "ai"
      ? "bg-zinc-900 border-zinc-800 text-zinc-400"
      : "bg-white border-white text-black",
    isTyping && "border-zinc-700"
  )}>
    {role === "ai" ? (
      <Bot className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    )}
  </div>
);

// --- Strategy Card (Minimal) ---
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

  if (lowerTitle.includes("fear") || lowerTitle.includes("risk") || lowerTitle.includes("страх"))
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
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(option)}
      className="group cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200 p-4 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        {option.confidence && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-800">
            <BarChart2 className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-medium text-zinc-400">{option.confidence}% match</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-zinc-100 mb-1 group-hover:text-white transition-colors">
        {option.title}
      </h3>

      <p className="text-xs text-zinc-500 mb-4 line-clamp-2">
        {option.description}
      </p>

      <div className="mt-auto pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mb-2">
          <span className="uppercase">Viral Hook</span>
        </div>
        <p className="text-xs italic text-zinc-300 font-medium">"{option.hook_text}"</p>
      </div>

      <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-zinc-500">{option.estimated_views || "High potential"}</span>
        <ArrowRight className="h-3 w-3 text-zinc-400" />
      </div>
    </motion.div>
  );
};

// --- Typing Indicator (Minimal) ---
const TypingIndicator = ({ language }: { language: "en" | "ru" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-1"
    >
      <Avatar role="ai" isTyping />
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_400ms]" />
      </div>
    </motion.div>
  );
};

// --- Message Bubble (Clean) ---
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
      rawText = rawText.replace(/\*\*/g, "").replace(/—/g, "-").replace(/__/g, "");
      strategies = JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse hidden options:", e);
    }
  } else {
    rawText = rawText.replace(/\*\*/g, "").replace(/—/g, "-").replace(/__/g, "");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex w-full gap-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <Avatar role="ai" />}

      <div className={cn("max-w-[85%] flex flex-col gap-2", isUser && "items-end")}>
        {/* Timestamp */}
        <div className="flex items-center gap-2 px-1 opacity-50">
          <span className="text-[10px] text-zinc-500">
            {isUser ? "You" : "AI"}
          </span>
        </div>

        {/* Text Content */}
        {rawText && (
          <div
            className={cn(
              "rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words",
              isUser
                ? "bg-white text-black shadow-sm"
                : "bg-transparent text-zinc-300 pl-0 pt-0" // Minimal AI text
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
          <div className="w-full mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
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

      {isUser && <Avatar role="user" />}
    </motion.div>
  );
};

export function ViralChat({
  initialMessage,
  onStrategySelect,
  className,
}: ViralChatProps) {
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setMessages([{
      id: "init",
      role: "ai",
      content: language === "en"
        ? "Ready to engineer viral content. What's your niche?"
        : "Готов создать вирусный контент. Какая у вас ниша?",
      timestamp: Date.now(),
    }]);
  }, [language]); // Depend on language to update greeting

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM updated
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
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

      if (!response.ok) throw new Error("Network Error");
      if (!response.body) throw new Error("No response");

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

  return (
    <div
      className={cn(
        "flex flex-col w-full h-[75vh] md:h-[700px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-white flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Viral Architect</h3>
            <p className="text-[10px] text-zinc-500">AI-Powered Content Strategy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(["en", "ru"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "px-2 py-1 text-[10px] uppercase font-medium rounded transition-colors",
                language === lang
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-800"
        ref={scrollRef}
      >
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onStrategySelect={onStrategySelect}
            />
          ))}
          {isTyping && <TypingIndicator language={language} />}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto relative flex items-center gap-2">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "en" ? "Describe your niche..." : "Опишите вашу нишу..."}
            className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-white text-black hover:bg-zinc-200 transition-colors h-10 w-10 disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
