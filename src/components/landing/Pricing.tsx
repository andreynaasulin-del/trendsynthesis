"use client";

import { Check, Zap, Sparkles, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingProps {
    lang: "en" | "ru";
}

export function Pricing({ lang }: PricingProps) {
    const t = {
        en: {
            title: "Select Protocol",
            subtitle: "Choose the level of influence you require",
            monthly: "/ month",
            start: "INITIATE",
            popular: "MOST POPULAR",
            plans: [
                {
                    name: "STARTER",
                    price: "$0",
                    desc: "For testing the algorithm.",
                    features: [
                        "3 Projects per month",
                        "720p Render quality",
                        "Standard Templates",
                        "Watermarked Output"
                    ],
                    icon: Zap,
                    highlight: false
                },
                {
                    name: "CREATOR",
                    price: "$29",
                    desc: "For consistent viral growth.",
                    features: [
                        "20 Projects per month",
                        "1080p HD Render",
                        "Premium Strategies (High Confidence)",
                        "No Watermark",
                        "Priority Processing"
                    ],
                    icon: Sparkles,
                    highlight: true
                },
                {
                    name: "AGENCY",
                    price: "$99",
                    desc: "For domination and scale.",
                    features: [
                        "Unlimited Projects",
                        "4K Ultra HD Render",
                        "API Access",
                        "White Label Reports",
                        "Dedicated Manager"
                    ],
                    icon: Building2,
                    highlight: false
                }
            ]
        },
        ru: {
            title: "Выберите Протокол",
            subtitle: "Уровень вашего влияния",
            monthly: "/ месяц",
            start: "НАЧАТЬ",
            popular: "ПОПУЛЯРНЫЙ ВЫБОР",
            plans: [
                {
                    name: "STARTER",
                    price: "0₽",
                    desc: "Для теста алгоритмов.",
                    features: [
                        "3 Проект в месяц",
                        "Качество 720p",
                        "Базовые шаблоны",
                        "Водяной знак"
                    ],
                    icon: Zap,
                    highlight: false
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
                        "Приоритетная очередь"
                    ],
                    icon: Sparkles,
                    highlight: true
                },
                {
                    name: "AGENCY",
                    price: "9900₽",
                    desc: "Масштаб и доминирование.",
                    features: [
                        "Безлимит проектов",
                        "4K Ultra HD Рендер",
                        "API Доступ",
                        "White Label отчеты",
                        "Личный менеджер"
                    ],
                    icon: Building2,
                    highlight: false
                }
            ]
        }
    };

    const content = t[lang];

    return (
        <section id="pricing" className="py-32 px-6 relative border-t border-white/5">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {content.title}
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        {content.subtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {content.plans.map((plan, i) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "relative rounded-2xl p-8 border backdrop-blur-xl flex flex-col transition-all duration-300 group hover:translate-y-[-4px]",
                                    plan.highlight
                                        ? "bg-white/5 border-violet-500/50 shadow-2xl shadow-violet-500/10"
                                        : "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20"
                                )}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                                        {content.popular}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300",
                                        plan.highlight ? "bg-violet-600/20 text-violet-400" : "bg-white/5 text-white/40 group-hover:text-white"
                                    )}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-sm font-bold tracking-widest text-white/60 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                                        <span className="text-white/30 text-sm">{content.monthly}</span>
                                    </div>
                                    <p className="text-white/40 text-sm mt-3">{plan.desc}</p>
                                </div>

                                <div className="flex-1 mb-8 space-y-4">
                                    {plan.features.map((feature, j) => (
                                        <div key={j} className="flex items-start gap-3 text-sm text-white/70">
                                            <Check className={cn(
                                                "w-4 h-4 mt-0.5 shrink-0",
                                                plan.highlight ? "text-violet-400" : "text-white/30"
                                            )} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/signup"
                                    className={cn(
                                        "w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center",
                                        plan.highlight
                                            ? "bg-white text-black hover:bg-violet-50 hover:scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                                            : "bg-white/5 text-white hover:bg-white/10 hover:text-white border border-white/5"
                                    )}
                                >
                                    {content.start}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
