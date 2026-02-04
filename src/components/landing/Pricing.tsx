"use client";

import { Check, Zap, Sparkles, Building2, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PricingProps {
    lang: "en" | "ru";
}

export function Pricing({ lang }: PricingProps) {
    const t = {
        en: {
            title: "Select Protocol",
            subtitle: "Choose the level of influence you require",
            monthly: "/ month",
            start: "GET STARTED",
            popular: "MOST POPULAR",
            enterprise: "CONTACT US",
            plans: [
                {
                    name: "STARTER",
                    price: "$0",
                    desc: "For testing the algorithm.",
                    features: [
                        "3 Projects per month",
                        "720p Render quality",
                        "Standard Templates",
                        "Watermarked Output",
                        "Community Support"
                    ],
                    icon: Zap,
                    highlight: false,
                    gradient: "from-zinc-500/20 to-zinc-600/5",
                    cta: "Start Free"
                },
                {
                    name: "CREATOR",
                    price: "$29",
                    desc: "For consistent viral growth.",
                    features: [
                        "20 Projects per month",
                        "1080p HD Render",
                        "Premium Strategies",
                        "No Watermark",
                        "Priority Processing",
                        "Analytics Dashboard"
                    ],
                    icon: Sparkles,
                    highlight: true,
                    gradient: "from-violet-500/20 to-purple-600/10",
                    cta: "Get Creator"
                },
                {
                    name: "AGENCY",
                    price: "$99",
                    desc: "For domination and scale.",
                    features: [
                        "Unlimited Projects",
                        "4K Ultra HD Render",
                        "API Access",
                        "White Label Export",
                        "Dedicated Manager",
                        "Custom Integrations"
                    ],
                    icon: Building2,
                    highlight: false,
                    gradient: "from-amber-500/20 to-orange-600/5",
                    cta: "Contact Sales"
                }
            ]
        },
        ru: {
            title: "Выберите Протокол",
            subtitle: "Уровень вашего влияния",
            monthly: "/ месяц",
            start: "НАЧАТЬ",
            popular: "ПОПУЛЯРНЫЙ",
            enterprise: "СВЯЗАТЬСЯ",
            plans: [
                {
                    name: "STARTER",
                    price: "0₽",
                    desc: "Для теста алгоритмов.",
                    features: [
                        "3 Проекта в месяц",
                        "Качество 720p",
                        "Базовые шаблоны",
                        "Водяной знак",
                        "Поддержка сообщества"
                    ],
                    icon: Zap,
                    highlight: false,
                    gradient: "from-zinc-500/20 to-zinc-600/5",
                    cta: "Начать бесплатно"
                },
                {
                    name: "CREATOR",
                    price: "2900₽",
                    desc: "Для системного роста.",
                    features: [
                        "20 Проектов в месяц",
                        "1080p HD Рендер",
                        "Премиум Стратегии",
                        "Без водяных знаков",
                        "Приоритетная очередь",
                        "Панель аналитики"
                    ],
                    icon: Sparkles,
                    highlight: true,
                    gradient: "from-violet-500/20 to-purple-600/10",
                    cta: "Выбрать Creator"
                },
                {
                    name: "AGENCY",
                    price: "9900₽",
                    desc: "Масштаб и доминирование.",
                    features: [
                        "Безлимит проектов",
                        "4K Ultra HD Рендер",
                        "API Доступ",
                        "White Label экспорт",
                        "Личный менеджер",
                        "Кастомные интеграции"
                    ],
                    icon: Building2,
                    highlight: false,
                    gradient: "from-amber-500/20 to-orange-600/5",
                    cta: "Связаться"
                }
            ]
        }
    };

    const content = t[lang];

    return (
        <section id="pricing" className="py-32 px-6 relative border-t border-white/5 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-6">
                        <Crown className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-mono tracking-widest text-white/60">PRICING PROTOCOLS</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-xl">
                        {content.title}
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        {content.subtitle}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
                    {content.plans.map((plan, i) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={cn(
                                    "relative rounded-3xl p-8 border backdrop-blur-2xl flex flex-col transition-all duration-500 group",
                                    plan.highlight
                                        ? "bg-black/60 border-violet-500/50 shadow-[0_0_50px_rgba(139,92,246,0.15)] scale-[1.05] z-10"
                                        : "bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20 hover:translate-y-[-4px]"
                                )}
                            >
                                {/* Selected Glow */}
                                {plan.highlight && (
                                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                                )}

                                {/* Popular badge */}
                                {plan.highlight && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#050505] border border-violet-500 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-1.5 uppercase z-20">
                                        <Sparkles className="w-3 h-3 text-violet-400 fill-violet-400" />
                                        {content.popular}
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-8">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 border",
                                            plan.highlight
                                                ? "bg-violet-500/10 text-violet-400 border-violet-500/20 group-hover:scale-110"
                                                : "bg-white/5 text-white/40 border-white/10 group-hover:text-white"
                                        )}>
                                            <Icon size={24} />
                                        </div>
                                        <h3 className="text-xs font-bold tracking-[0.2em] text-white/50 mb-4">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className={cn(
                                                "text-5xl font-extrabold tracking-tight",
                                                plan.highlight ? "text-white" : "text-white/80"
                                            )}>{plan.price}</span>
                                            <span className="text-white/30 text-sm">{content.monthly}</span>
                                        </div>
                                        <p className="text-white/40 text-sm mt-4 min-h-[40px]">{plan.desc}</p>
                                    </div>

                                    <div className="flex-1 mb-8 space-y-4">
                                        <div className="h-px w-full bg-white/5 mb-6" />
                                        {plan.features.map((feature, j) => (
                                            <div key={j} className="flex items-start gap-3 text-sm text-white/70">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
                                                    plan.highlight ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-white/5 border-white/10 text-white/40"
                                                )}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href={plan.name === 'AGENCY' ? "/contact" : "/signup"}
                                        className={cn(
                                            "w-full py-4 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group/btn",
                                            plan.highlight
                                                ? "bg-white text-black hover:bg-gray-100 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                                : "bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {plan.cta}
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 text-white/30 text-xs font-mono tracking-wider border-t border-white/5 pt-12"
                >
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-500/60" />
                        <span>{lang === "ru" ? "ОТМЕНА В ЛЮБОЙ МОМЕНТ" : "CANCEL ANYTIME"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-500/60" />
                        <span>{lang === "ru" ? "БЕЗ СКРЫТЫХ ПЛАТЕЖЕЙ" : "NO HIDDEN FEES"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-emerald-500/60" />
                        <span>{lang === "ru" ? "БЕЗОПАСНАЯ ОПЛАТА" : "SECURE PAYMENT"}</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
