"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, Skull, TrendingUp, Sparkles, User, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Types ---
export interface StrategyOption {
    id: string;
    title: string;
    hook_text: string;
    description: string;
}

interface Message {
    id: string;
    role: "user" | "ai";
    content: string; // Can contain <options>...</options>
    timestamp: number;
}

interface ViralChatProps {
    initialMessage?: string;
    onStrategySelect?: (strategy: StrategyOption) => void;
    className?: string;
}

// --- Icons Map ---
const STRATEGY_ICONS = {
    fear: Skull,
    hype: TrendingUp,
    value: Zap,
    default: Sparkles,
};

// --- Strategy Card Component ---
const StrategyCard = ({
    option,
    onSelect
}: {
    option: StrategyOption;
    onSelect: (s: StrategyOption) => void
}) => {
    // Determine icon based on title keywords
    let Icon = STRATEGY_ICONS.default;
    const lowerTitle = option.title.toLowerCase();

    if (lowerTitle.includes("fear") || lowerTitle.includes("risk") || lowerTitle.includes("страх") || lowerTitle.includes("риск")) Icon = STRATEGY_ICONS.fear;
    else if (lowerTitle.includes("trend") || lowerTitle.includes("viral") || lowerTitle.includes("тренд")) Icon = STRATEGY_ICONS.hype;
    else if (lowerTitle.includes("value") || lowerTitle.includes("hack") || lowerTitle.includes("ценност")) Icon = STRATEGY_ICONS.value;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-5 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-primary/10"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-bold text-zinc-100 group-hover:text-primary transition-colors text-sm tracking-wide uppercase">{option.title}</h3>
                    <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4 text-zinc-400 group-hover:text-primary" />
                    </div>
                </div>

                <p className="text-xs leading-relaxed text-zinc-400 group-hover:text-zinc-300">
                    {option.description}
                </p>

                <div className="mt-auto pt-2">
                    <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                        <p className="font-mono text-[10px] text-primary/90">
                            &gt; CAPTION_HOOK: &quot;{option.hook_text}&quot;
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Message Parser Logic ---
const MessageBubble = ({
    message,
    onStrategySelect
}: {
    message: Message;
    onStrategySelect?: (s: StrategyOption) => void
}) => {
    const isUser = message.role === "user";

    // The Shadow Parser logic
    const optionsRegex = /<options>([\s\S]*?)<\/options>/;
    const match = message.content.match(optionsRegex);

    let rawText = message.content;
    let strategies: StrategyOption[] = [];

    if (match && match[1]) {
        try {
            rawText = message.content.replace(match[0], "").trim();
            strategies = JSON.parse(match[1]);
        } catch (e) {
            console.error("Failed to parse hidden options:", e);
        }
    }

    // Use rawText directly to rely on stream visual effect
    const displayText = rawText;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex w-full gap-4",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-white/10 shadow-lg">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </div>
            )}

            <div className={cn("max-w-[85%] flex flex-col gap-4", isUser && "items-end")}>
                {/* Text Content */}
                {rawText && (
                    <div
                        className={cn(
                            "rounded-2xl px-6 py-4 text-sm leading-6 shadow-md backdrop-blur-sm",
                            isUser
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-zinc-900/80 border border-white/10 text-zinc-200 rounded-bl-none font-mono"
                        )}
                    >
                        {displayText.split("\n").map((line, i) => (
                            <p key={i} className="min-h-[1em] mb-1 last:mb-0">{line}</p>
                        ))}
                    </div>
                )}

                {/* Strategies Grid (Rendered from hidden JSON) */}
                {!isUser && strategies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full mt-2"
                    >
                        {strategies.map((strategy) => (
                            <StrategyCard
                                key={strategy.id}
                                option={strategy}
                                onSelect={onStrategySelect ? (s) => onStrategySelect(s) : () => { }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {isUser && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 border border-white/10 shadow-lg">
                    <User className="h-5 w-5 text-zinc-600" />
                </div>
            )}
        </motion.div>
    );
};

// --- Visual & Functional Enhancements ---
export function ViralChat({
    initialMessage,
    onStrategySelect,
    className
}: ViralChatProps) {
    const [language, setLanguage] = useState<"en" | "ru">("en");

    // Dynamic Initial Greeting
    const greeting = initialMessage || (language === "en"
        ? "Ready to create viral content. Describe your niche."
        : "Готов создать вирусный контент. Опишите вашу нишу.");

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
    const [isTyping, setIsTyping] = useState(false);

    // Update greeting when language changes IF chat is empty or only has initial message
    useEffect(() => {
        if (messages.length <= 1 && messages[0].role === "ai") {
            setMessages([{
                id: "init",
                role: "ai",
                content: language === "en"
                    ? "Ready to create viral content. Describe your niche."
                    : "Готов создать вирусный контент. Опишите вашу нишу.",
                timestamp: Date.now(),
            }]);
        }
    }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
                    // Include language in the payload
                    language: language,
                    messages: messages.concat(newMsg).map(m => ({
                        role: m.role === 'ai' ? 'assistant' : m.role,
                        content: m.content
                    }))
                })
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

            // Initial AI Message placeholder
            const aiMsgId = (Date.now() + 1).toString();
            setMessages((prev) => [
                ...prev,
                {
                    id: aiMsgId,
                    role: "ai",
                    content: "",
                    timestamp: Date.now(),
                },
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
                        prev.map(m =>
                            m.id === aiMsgId
                                ? { ...m, content: accumContent }
                                : m
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
                    content: `Error: ${error.message || "Connection lost. Please try again."}`,
                    timestamp: Date.now(),
                }
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
        <div className={cn("flex flex-col h-[700px] w-full max-w-5xl mx-auto border border-white/10 bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 ring-1 ring-white/5", className)}>
            {/* Header with Language Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/50 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-500 opacity-50"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                    <span className="font-mono text-sm font-bold tracking-widest text-zinc-400">
                        VIRAL_CHAT_V2.0
                    </span>
                </div>

                {/* Language Toggle */}
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1">
                    <button
                        onClick={() => setLanguage("en")}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-all",
                            language === "en"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLanguage("ru")}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium transition-all",
                            language === "ru"
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        RU
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 pointer-events-none"></div>

                <div className="h-full overflow-y-auto px-6 py-8 relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent" ref={scrollRef}>
                    <div className="flex flex-col gap-8">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    onStrategySelect={onStrategySelect}
                                />
                            ))}
                        </AnimatePresence>
                        {isTyping && (
                            <div className="flex items-center gap-2 px-4 py-2">
                                <span className="text-xs font-mono text-primary animate-pulse">
                                    {language === "en" ? "ANALYZING_PATTERNS..." : "АНАЛИЗ_ТРЕНДОВ..."}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 bg-zinc-900/30 p-4 backdrop-blur-md">
                <div className="relative flex items-center gap-3">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={language === "en" ? "Describe your video idea..." : "Опишите идею видео..."}
                        className="h-12 pl-4 pr-14 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-2 h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-2 flex justify-between px-2">
                    <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {language === "en" ? "GLOBAL_TRENDS_DB" : "БАЗА_ТРЕНДОВ"}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono">
                        {language === "en" ? "PRESS ENTER TO SEND" : "НАЖМИТЕ ENTER"}
                    </span>
                </div>
            </div>
        </div>
    );
}
