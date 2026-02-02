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
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StrategyOption } from "@/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useGenerationStore } from "@/stores/generation-store";

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

const STRATEGY_ICONS: Record<string, React.ElementType> = {
  fear: Lock,
  hype: TrendingUp,
  value: Zap,
  insider: Eye,
  story: Target,
  default: Sparkles,
};

const Avatar = ({ role, isTyping }: { role: "user" | "ai"; isTyping?: boolean }) => (
  <div className={cn(
    "relative shrink-0 h-9 w-9 rounded-full flex items-center justify-center border transition-colors",
    role === "ai"
      ? "bg-zinc-900 border-zinc-800 text-zinc-400"
      : "bg-white border-white text-black",
    isTyping && "border-zinc-700"
  )}>
    {role === "ai" ? (
      <Bot className="h-5 w-5" />
    ) : (
      <User className="h-5 w-5" />
    )}
  </div>
);

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
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(option)}
      className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all duration-200 p-5 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        {option.confidence && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50 border border-zinc-800">
            <BarChart2 className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-medium text-zinc-400">{option.confidence}% match</span>
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
        {option.title}
      </h3>

      <p className="text-sm text-zinc-500 mb-5 line-clamp-2 leading-relaxed">
        {option.description}
      </p>

      <div className="mt-auto pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mb-2">
          <span className="uppercase tracking-wider">Viral Hook</span>
        </div>
        <p className="text-sm italic text-zinc-300 font-medium leading-relaxed">"{option.hook_text}"</p>
      </div>

      <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-zinc-500 font-mono">{option.estimated_views || "High potential"}</span>
        <ArrowRight className="h-4 w-4 text-zinc-400" />
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-1"
    >
      <Avatar role="ai" isTyping />
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-none bg-zinc-900/50 border border-zinc-800">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-[bounce_1.4s_infinite_400ms]" />
      </div>
    </motion.div>
  );
};

const MessageBubble = ({
  message,
  onStrategySelect,
}: {
  message: Message;
  onStrategySelect?: (s: StrategyOption) => void;
}) => {
  const isUser = message.role === "user";

  // --- SMART PARSER (Task #1) ---
  const splitIndex = message.content.indexOf("<options>");
  let visibleText = message.content;
  let strategies: StrategyOption[] = [];

  if (splitIndex !== -1) {
    // Hide everything after <options>
    visibleText = message.content.slice(0, splitIndex).trim();

    // Attempt parse
    const optionsContent = message.content.slice(splitIndex);
    const match = optionsContent.match(/<options>([\s\S]*?)<\/options>/);
    if (match && match[1]) {
      try {
        // Clean potentially partial JSON
        strategies = JSON.parse(match[1]);
      } catch (e) {
        // Wait for full stream
      }
    }
  }

  // Cleanup formatting
  visibleText = visibleText.replace(/\*\*/g, "").replace(/—/g, "-").replace(/__/g, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex w-full gap-4 md:gap-5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <Avatar role="ai" />}

      <div className={cn("max-w-[85%] md:max-w-[75%] flex flex-col gap-2", isUser && "items-end")}>
        {/* Timestamp */}
        <div className="flex items-center gap-2 px-1 opacity-50">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            {isUser ? "You" : "AI Architect"}
          </span>
        </div>

        {/* Text Content (Task #4: Typography Polish) */}
        {visibleText && (
          <div
            className={cn(
              "rounded-2xl px-5 py-4 text-base leading-relaxed whitespace-pre-wrap break-words shadow-sm",
              isUser
                ? "bg-white text-black rounded-tr-none"
                : "bg-transparent text-zinc-300 pl-0 pt-0 border-none shadow-none" // Minimal AI text
            )}
          >
            {visibleText.split("\n").map((line, i) => (
              <p key={i} className={cn("min-h-[1em]", i > 0 && "mt-2")}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Strategy Cards Rendered OUTSIDE bubble */}
        {!isUser && strategies.length > 0 && (
          <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-px bg-zinc-800 w-8" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Proposed Strategies</span>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
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
  const setStoreLanguage = useGenerationStore((state) => state.setLanguage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Task #2: Correct localization init
    const greeting = language === "en"
      ? "Ready to engineer viral content. What's your niche?"
      : "Готов создать вирусный контент. Какая у вас ниша?";

    setMessages([{
      id: "init",
      role: "ai",
      content: greeting,
      timestamp: Date.now(),
    }]);
  }, [language]);

  // Task #4: Hide logs logic (Already hidden in UI, this component is purely Chat)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      // Use timeout to allow rendering to complete
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
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
            content: m.content, // Pass full content including hidden options for context history
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
        "flex flex-col w-full h-[80vh] md:h-[750px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Viral Architect</h3>
            <p className="text-xs text-zinc-500">AI-Powered Content Strategy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(["en", "ru"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setStoreLanguage(lang);
              }}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-colors",
                language === lang
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-zinc-300 bg-zinc-900"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
        ref={scrollRef}
      >
        <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onStrategySelect={onStrategySelect}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Input */}
      <div className="p-5 bg-zinc-900/30 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto relative flex items-center gap-3">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "en" ? "Describe your niche... (e.g. Real Estate in Dubai)" : "Опишите нишу... (например: Недвижимость в Дубае)"}
            className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all font-light"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="bg-white text-black hover:bg-zinc-200 transition-colors h-12 w-12 rounded-xl disabled:opacity-50"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-2 font-mono uppercase tracking-widest">
          {language === 'en' ? 'AI can make mistakes. Check important info.' : 'AI может ошибаться.'}
        </p>
      </div>
    </div>
  );
}
