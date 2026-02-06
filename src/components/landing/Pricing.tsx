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

    const planTranslations = {
        creator: {
            name: "Пакет Креатор",
            features: ["80 Кредитов", "1080p HD", "Без водяных знаков"]
        },
        pro: {
            name: "Пакет Про",
            features: ["250 Кредитов", "Приоритетная генерация", "Коммерческие права", "+50% Бонусных кредитов"]
        },
        agency: {
            name: "Агентство (God Mode)",
            features: ["1000 Кредитов (Масштаб)", "Бизнес AI Включен (Навсегда)", "Viral DNA Stealer (Бета)", "Личная поддержка"]
        }
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch mb-20 relative z-10">

                    {/* 1. CREATOR PACK */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0 }}
                        className="relative p-6 lg:p-8 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl flex flex-col h-full shadow-lg group hover:border-white/20 transition-all duration-300"
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white/90 mb-2 tracking-wide">
                                {isRu ? planTranslations.creator.name : credits.creator.name}
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">${credits.creator.amount}</span>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1 mb-8">
                            {(isRu ? planTranslations.creator.features : credits.creator.features).map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                    <Check className="w-4 h-4 text-white/40" />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                        <Link href={`/api/checkout?type=credits&pack=creator`} className="mt-auto">
                            <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/10 transition-all">
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
                        className="relative p-8 lg:p-10 rounded-3xl border-2 border-violet-500/60 bg-slate-950/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(139,92,246,0.15)] md:-mt-4 md:-mb-4 z-20 flex flex-col h-full overflow-hidden"
                    >
                        {/* Glow Behind */}
                        <div className="absolute inset-0 bg-violet-600/5 blur-[80px] -z-10 pointer-events-none" />

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 text-white text-[10px] sm:text-xs font-bold tracking-widest px-6 py-1.5 rounded-full uppercase shadow-[0_5px_20px_rgba(124,58,237,0.4)] border border-violet-400">
                            {content.mostPopular}
                        </div>

                        <div className="mb-8 mt-2">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                {isRu ? planTranslations.pro.name : credits.pro.name}
                                <Sparkles className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-6xl font-black text-white tracking-tight">${credits.pro.amount}</span>
                            </div>
                            <p className="text-violet-200/60 text-xs mt-2 font-mono uppercase tracking-wide">
                                {isRu ? "$0.19 / кредит" : "$0.19 / credit"}
                            </p>
                        </div>

                        <div className="space-y-4 flex-1 mb-10">
                            {(isRu ? planTranslations.pro.features : credits.pro.features).map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-zinc-200">
                                    <div className="p-1 rounded-full bg-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                                        <Check className="w-3.5 h-3.5 text-violet-300" />
                                    </div>
                                    <span className="font-medium tracking-tight">{f}</span>
                                </div>
                            ))}
                        </div>

                        <Link href={`/api/checkout?type=credits&pack=pro`} className="mt-auto">
                            <button className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-zinc-100 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
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
                        className="relative p-6 lg:p-8 rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-black backdrop-blur-xl flex flex-col h-full overflow-hidden group hover:border-slate-500 transition-all duration-500"
                    >
                        {/* Metallic Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300 flex items-center gap-2">
                                        {isRu ? planTranslations.agency.name : credits.agency.name}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 tracking-[0.2em] uppercase font-bold">{content.agencyMode}</span>
                                </div>
                                <Crown className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-white">${credits.agency.amount}</span>
                            </div>

                            <div className="space-y-4 flex-1 mb-8">
                                {(isRu ? planTranslations.agency.features : credits.agency.features).map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                        <Check className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
                                        <span className={cn(f.includes("DNA") ? "text-red-400 font-bold flex items-center gap-2" : "")}>
                                            {f}
                                            {f.includes("DNA") && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-help hover:bg-red-500/20 transition-colors">
                                                                <Flame className="w-3 h-3" />
                                                                {content.new}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-slate-950 border-slate-800 text-slate-300 text-xs p-2">
                                                            <p>Clone pacing & hooks from existing viral videos.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link href={`/api/checkout?type=credits&pack=agency`} className="mt-auto">
                                <button className="w-full py-3 rounded-xl bg-slate-800 border border-slate-600 text-white font-medium hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all shadow-lg active:scale-[0.98]">
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
                    className="max-w-5xl mx-auto relative z-10"
                >
                    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-black/80 to-amber-950/30 backdrop-blur-md p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.05)]">

                        {/* Shimmer line */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        <div className="flex items-start gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                <Brain className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 flex flex-wrap items-center gap-3">
                                    Business AI Consultant
                                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-wide">
                                        {content.freeTrial}
                                    </span>
                                </h3>
                                <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
                                    {isRu
                                        ? "Получи доступ к ИИ-стратегу без покупки кредитов. Анализ ниш, генерация сценариев и плейбуки."
                                        : "Access the AI Strategist without buying credits. Niche analysis, script generation, and growth playbooks."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2 shrink-0 relative z-10 w-full md:w-auto">
                            <div className="text-center md:text-right mb-2">
                                <span className="text-3xl font-bold text-white tracking-tight">${business.amount}</span>
                                <span className="text-zinc-500 text-sm font-medium">{content.perMonth}</span>
                            </div>
                            <Link href={`/api/checkout?type=subscription`} className="w-full md:w-auto">
                                <button className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
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
