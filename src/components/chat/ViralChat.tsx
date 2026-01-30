"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, Skull, TrendingUp, Sparkles, User } from "lucide-react";
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

// --- Typewriter Effect Hook ---
const useTypewriter = (text: string, speed = 30) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return displayedText;
};

// --- Strategy Card Component ---
const StrategyCard = ({
    option,
    onSelect
}: {
    option: StrategyOption;
    onSelect: (s: StrategyOption) => void
}) => {
    // Determine icon based on title keywords (simple heuristics)
    let Icon = STRATEGY_ICONS.default;
    const lowerTitle = option.title.toLowerCase();

    // @ts-ignore
    if (lowerTitle.includes("fear") || lowerTitle.includes("risk")) Icon = STRATEGY_ICONS.fear;
    // @ts-ignore
    else if (lowerTitle.includes("trend") || lowerTitle.includes("viral")) Icon = STRATEGY_ICONS.hype;
    // @ts-ignore
    else if (lowerTitle.includes("value") || lowerTitle.includes("hack")) Icon = STRATEGY_ICONS.value;

    return (
        <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-black/40 p-4 transition-colors hover:border-primary/50"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white group-hover:text-primary">{option.title}</h3>
                    <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>

                <p className="text-xs text-muted-foreground group-hover:text-white/80">
                    {option.description}
                </p>

                <div className="mt-2 rounded bg-white/5 p-2 font-mono text-[10px] text-primary/80">
                    &quot;{option.hook_text}&quot;
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
    // Use [\s\S] to match newlines
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

    // Apply typewriter only to AI and only for the text part
    const displayText = isUser ? rawText : useTypewriter(rawText, 15);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex w-full gap-3",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
            )}

            <div className={cn("max-w-[85%] space-y-4", isUser && "text-right")}>
                {/* Text Content */}
                {rawText && (
                    <div
                        className={cn(
                            "rounded-2xl px-4 py-3 text-sm",
                            isUser
                                ? "bg-primary text-primary-foreground ml-auto inline-block text-left"
                                : "bg-muted/50 font-mono text-foreground border border-border/50"
                        )}
                    >
                        {displayText.split("\n").map((line, i) => (
                            <p key={i} className="min-h-[1.5em]">{line}</p>
                        ))}
                    </div>
                )}

                {/* Strategies Grid (Rendered from hidden JSON) */}
                {!isUser && strategies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
            )}
        </motion.div>
    );
};

// --- Construct of ViralChat ---
export function ViralChat({
    initialMessage = "Ready to create viral content. Describe your niche.",
    onStrategySelect,
    className
}: ViralChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "init",
            role: "ai",
            content: initialMessage,
            timestamp: Date.now(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);

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
                // Send history excluding the last user message we just added (to avoid dupes if logic differs) 
                // actually simplest is to send all messages including the new one
                body: JSON.stringify({
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
        <div className={cn("flex flex-col h-[600px] w-full max-w-4xl mx-auto border border-border bg-background rounded-xl overflow-hidden shadow-2xl", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-6 py-4">
                <div className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <span className="font-mono text-sm font-medium tracking-wider text-muted-foreground">
                    VIRAL_CHAT_V1.0 // ONLINE
                </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative bg-black/50">
                <div className="h-full overflow-y-auto px-6 py-6" ref={scrollRef}>
                    <div className="flex flex-col gap-6">
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
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-muted-foreground"
                            >
                                <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "0s" }} />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "0.2s" }} />
                                <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: "0.4s" }} />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-background p-4">
                <div className="relative flex items-center gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your video idea..."
                        className="pr-12 bg-muted/50 border-border/50 focus-visible:ring-primary/50"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-1 h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-2 flex justify-between px-1">
                    <span className="text-[10px] text-muted-foreground font-mono">AI-POWERED ANALYSIS</span>
                    <span className="text-[10px] text-muted-foreground font-mono">PRESS ENTER TO SEND</span>
                </div>
            </div>
        </div>
    );
}
