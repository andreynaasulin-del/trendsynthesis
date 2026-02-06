"use client";

import { Check, Zap, Sparkles, Building2, Crown, ArrowRight, Coins, Brain, Gift } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";

interface PricingProps {
    lang: "en" | "ru";
}

export function Pricing({ lang }: PricingProps) {
    const isRu = lang === "ru";

    const content = {
        title: isRu ? "Гибкая экономика" : "Flexible Pricing",
        subtitle: isRu
            ? "Плати за то, что используешь. Без подписок на генерации."
            : "Pay for what you use. No subscriptions for generations.",
        creditsTitle: isRu ? "ПАКЕТЫ КРЕДИТОВ" : "CREDIT PACKS",
        creditsDesc: isRu ? "1 кредит = 1 генерация (до 30 видео)" : "1 credit = 1 generation (up to 30 videos)",
        subscriptionTitle: isRu ? "ПОДПИСКА" : "SUBSCRIPTION",
        freeTitle: isRu ? "БЕСПЛАТНО" : "FREE",
        freeDesc: isRu ? "3 генерации на старте" : "3 generations to start",
        popular: isRu ? "ПОПУЛЯРНЫЙ" : "POPULAR",
        bonus: isRu ? "бонус" : "bonus",
        perCredit: isRu ? "за кредит" : "per credit",
        perMonth: isRu ? "/мес" : "/mo",
        buyCredits: isRu ? "Купить кредиты" : "Buy Credits",
        subscribe: isRu ? "Подписаться" : "Subscribe",
        startFree: isRu ? "Начать бесплатно" : "Start Free",
    };

    const creditPacks = siteConfig.creditPacks;
    const businessSub = siteConfig.businessSubscription;
    const freeTier = siteConfig.freeTier;

    return (
        <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 relative border-t border-white/5 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-6">
                        <Crown className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-mono tracking-widest text-white/60">PRICING</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">{content.title}</h2>
                    <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto">{content.subtitle}</p>
                </motion.div>

                {/* Free Tier Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 p-4 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Gift className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{content.freeTitle}</h3>
                            <p className="text-sm text-white/50">{content.freeDesc}</p>
                        </div>
                    </div>
                    <Link
                        href="/signup"
                        className="px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                        {content.startFree} <ArrowRight className="w-4 h-4 inline ml-1" />
                    </Link>
                </motion.div>

                {/* Credit Packs Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <Coins className="w-5 h-5 text-violet-400" />
                        <h3 className="text-lg font-bold text-white">{content.creditsTitle}</h3>
                        <span className="text-xs text-white/40 font-mono">{content.creditsDesc}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {creditPacks.map((pack, i) => (
                            <motion.div
                                key={pack.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "relative rounded-2xl p-4 sm:p-6 border backdrop-blur-xl flex flex-col transition-all duration-300 group",
                                    pack.highlighted
                                        ? "bg-black/60 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
                                        : "bg-black/40 border-white/10 hover:border-white/20"
                                )}
                            >
                                {/* Popular badge */}
                                {pack.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-1 uppercase">
                                        <Sparkles className="w-3 h-3" />
                                        {content.popular}
                                    </div>
                                )}

                                {/* Bonus badge */}
                                {pack.bonus > 0 && (
                                    <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        +{pack.bonus}% {content.bonus}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h4 className="text-xs font-bold tracking-wider text-white/50 mb-2">
                                        {isRu ? pack.nameRu : pack.name}
                                    </h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl sm:text-4xl font-extrabold text-white">${pack.price}</span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-1">
                                        {pack.credits} {isRu ? "кредитов" : "credits"} · ${pack.pricePerCredit.toFixed(2)} {content.perCredit}
                                    </p>
                                </div>

                                <div className="flex-1 space-y-2 mb-4">
                                    {(isRu ? pack.features.ru : pack.features.en).map((f, j) => (
                                        <div key={j} className="flex items-start gap-2 text-xs text-white/60">
                                            <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={`/api/checkout?type=credits&pack=${pack.id}`}
                                    className={cn(
                                        "w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2",
                                        pack.highlighted
                                            ? "bg-white text-black hover:bg-gray-100"
                                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                    )}
                                >
                                    {content.buyCredits}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Business AI Subscription */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 sm:p-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono tracking-wider text-white/40 block">{content.subscriptionTitle}</span>
                                    <h3 className="text-xl font-bold text-white">{isRu ? businessSub.nameRu : businessSub.name}</h3>
                                </div>
                            </div>
                            <p className="text-white/50 text-sm mb-4">
                                {isRu
                                    ? "Безлимитный AI-помощник для бизнеса: стратегии, монетизация, анализ ниш, плейбуки роста."
                                    : "Unlimited AI business assistant: strategies, monetization, niche analysis, growth playbooks."}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {(isRu ? businessSub.features.ru : businessSub.features.en).map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                                        <Check className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-4">
                            <div className="text-center lg:text-right">
                                <span className="text-4xl sm:text-5xl font-extrabold text-white">${businessSub.price}</span>
                                <span className="text-white/40 text-sm">{content.perMonth}</span>
                            </div>
                            <Link
                                href="/api/checkout?type=subscription"
                                className="px-8 py-3 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors flex items-center gap-2"
                            >
                                {content.subscribe}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-12 text-white/30 text-[10px] sm:text-xs font-mono tracking-wider"
                >
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500/60" />
                        <span>{isRu ? "КРЕДИТЫ НЕ СГОРАЮТ" : "CREDITS NEVER EXPIRE"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500/60" />
                        <span>{isRu ? "ОТМЕНА ПОДПИСКИ В ЛЮБОЙ МОМЕНТ" : "CANCEL SUBSCRIPTION ANYTIME"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500/60" />
                        <span>{isRu ? "БЕЗОПАСНАЯ ОПЛАТА" : "SECURE PAYMENT"}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
