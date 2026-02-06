"use client";

import { Check, Zap, Sparkles, Building2, Crown, ArrowRight, Coins, Brain, Flame, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PRICING_CONFIG } from "@/config/pricing";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PricingProps {
    lang: "en" | "ru";
}

export function Pricing({ lang }: PricingProps) {
    const isRu = lang === "ru";

    // Text Content
    const content = {
        title: isRu ? "Стратегия Роста" : "Growth Strategy",
        subtitle: isRu
            ? "Инвестируй в вирусный охват. Максимальная рентабельность."
            : "Invest in viral reach. Maximum ROI.",
        mostPopular: isRu ? "ХИТ ПРОДАЖ" : "MOST POPULAR",
        agencyMode: isRu ? "РЕЖИМ БОГА" : "GOD MODE",
        subscribe: isRu ? "Активировать" : "Activate",
        buy: isRu ? "Купить" : "Buy Pack",
        perMonth: isRu ? "/мес" : "/mo",
        freeTrial: isRu ? "+7 Дней Бесплатно" : "+7 Days Free",
        activateBrain: isRu ? "Активировать Мозг" : "Activate Brain",
        new: isRu ? "NEW" : "NEW",
    };

    const { credits, business } = PRICING_CONFIG;

    return (
        <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/5 overflow-hidden bg-black/40">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[800px] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 border border-violet-500/20 bg-violet-500/10 rounded-full px-4 py-1.5 mb-6">
                        <Crown className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-mono tracking-widest text-violet-200 uppercase">
                            {content.title}
                        </span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tighter text-white">
                        {isRu ? "ВЫБЕРИ СВОЙ УРОВЕНЬ" : "CHOOSE YOUR TIER"}
                    </h2>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
                </motion.div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-center mb-20">

                    {/* 1. CREATOR PACK */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0 }}
                        className="relative p-6 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-md flex flex-col h-full"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-2">{credits.creator.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">${credits.creator.amount}</span>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1 mb-8">
                            {credits.creator.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                                    <Check className="w-4 h-4 text-white/50" />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                        <Link href={`/api/checkout?type=credits&pack=creator`}>
                            <button className="w-full py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                                {content.buy}
                            </button>
                        </Link>
                    </motion.div>

                    {/* 2. PRO PACK (HERO) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative p-8 rounded-3xl border-2 border-violet-500 bg-zinc-900/80 backdrop-blur-xl shadow-[0_0_50px_rgba(139,92,246,0.2)] md:scale-105 z-10 flex flex-col h-full"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-[10px] font-bold tracking-widest px-4 py-1 rounded-full uppercase shadow-lg">
                            {content.mostPopular}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                {credits.pro.name}
                                <Sparkles className="w-4 h-4 text-violet-400" />
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">${credits.pro.amount}</span>
                            </div>
                            <p className="text-violet-200/60 text-xs mt-2">$0.19 / credit</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-10">
                            {credits.pro.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-zinc-200">
                                    <div className="p-1 rounded-full bg-violet-500/20">
                                        <Check className="w-3.5 h-3.5 text-violet-400" />
                                    </div>
                                    <span className="font-medium">{f}</span>
                                </div>
                            ))}
                        </div>

                        <Link href={`/api/checkout?type=credits&pack=pro`}>
                            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all transform hover:scale-[1.02]">
                                {content.buy}
                            </button>
                        </Link>
                    </motion.div>

                    {/* 3. AGENCY (GOD MODE) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative p-6 rounded-3xl border border-slate-700 bg-slate-900/80 backdrop-blur-md flex flex-col h-full overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-transparent opacity-50" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        {credits.agency.name}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 tracking-widest uppercase">{content.agencyMode}</span>
                                </div>
                                <Crown className="w-6 h-6 text-amber-500" />
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-white">${credits.agency.amount}</span>
                            </div>

                            <div className="space-y-4 flex-1 mb-8">
                                {credits.agency.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <Check className="w-4 h-4 text-slate-500" />
                                        <span className={cn(f.includes("DNA") && "text-amber-400 font-bold flex items-center gap-2")}>
                                            {f}
                                            {f.includes("DNA") && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="bg-amber-500/20 text-amber-500 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-help">
                                                                <Flame className="w-3 h-3" />
                                                                {content.new}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-slate-950 border-slate-800 text-slate-300">
                                                            <p>Clone pacing & hooks from existing viral videos.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link href={`/api/checkout?type=credits&pack=agency`}>
                                <button className="w-full py-3 rounded-xl bg-slate-800 border border-slate-600 text-white font-medium hover:bg-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2">
                                    {content.buy}
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Business AI Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-900/40 via-black to-black p-1"
                >
                    <div className="bg-zinc-950/80 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">

                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="flex items-start gap-4 reltive z-10">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Brain className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    Business AI Consultant
                                    <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/20">
                                        {content.freeTrial}
                                    </span>
                                </h3>
                                <p className="text-zinc-400 text-sm max-w-md">
                                    {isRu
                                        ? "Получи стратегии, анализ ниш и скрипты для заработка."
                                        : "Get strategies, niche analysis, and money-making scripts."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-3 shrink-0 relative z-10">
                            <div className="text-right">
                                <span className="text-2xl font-bold text-white">${business.amount}</span>
                                <span className="text-zinc-500 text-sm">{content.perMonth}</span>
                            </div>
                            <Link href={`/api/checkout?type=subscription`}>
                                <button className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2">
                                    <Brain className="w-4 h-4" />
                                    {content.activateBrain}
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
