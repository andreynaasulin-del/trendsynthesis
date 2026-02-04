"use client";

import { motion } from "framer-motion";
import {
    Zap,
    Layers,
    Globe2,
    Clock,
    Sparkles,
    FileVideo,
    Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesProps {
    lang: "en" | "ru";
}

export function Features({ lang }: FeaturesProps) {
    const content = {
        en: {
            badge: "CAPABILITIES",
            title: "Built for virality",
            subtitle: "Every feature designed to maximize reach and engagement",
            features: [
                {
                    icon: Zap,
                    title: "AI Viral Scripts",
                    desc: "GPT-4o engineering trained on 1M+ viral videos generates hooks that grab attention instantly.",
                    gradient: "from-purple-500/20 to-blue-600/5",
                    colSpan: "md:col-span-2",
                    stat: "98% Retention"
                },
                {
                    icon: Clock,
                    title: "5 Minute Delivery",
                    desc: "From idea to 30 fully edited videos in the time it takes to grab coffee.",
                    gradient: "from-cyan-500/20 to-teal-600/5",
                    colSpan: "md:col-span-1"
                },
                {
                    icon: Layers,
                    title: "30 Unique Variations",
                    desc: "Never post the same content twice. Our engine varies angles, hooks, and footage.",
                    gradient: "from-emerald-500/20 to-green-600/5",
                    colSpan: "md:col-span-1"
                },
                {
                    icon: Globe2,
                    title: "Stock Intelligence",
                    desc: "Access to 5M+ premium assets automatically matched to your script context.",
                    gradient: "from-orange-500/20 to-amber-600/5",
                    colSpan: "md:col-span-2",
                    stat: "4K Quality"
                },
                {
                    icon: Languages,
                    title: "Global Reach",
                    desc: "Instantly translate and dub content into 20+ languages.",
                    gradient: "from-pink-500/20 to-rose-600/5",
                    colSpan: "md:col-span-1"
                },
                {
                    icon: FileVideo,
                    title: "Auto-Editing",
                    desc: "Perfect cuts, transitions, and dynamic subtitles without lifting a finger.",
                    gradient: "from-blue-500/20 to-indigo-600/5",
                    colSpan: "md:col-span-2"
                }
            ]
        },
        ru: {
            badge: "ВОЗМОЖНОСТИ",
            title: "Создано для вирусности",
            subtitle: "Каждая функция направлена на максимальный охват",
            features: [
                {
                    icon: Zap,
                    title: "AI Вирусные Скрипты",
                    desc: "GPT-4o, обученный на 1M+ вирусных видео, создает хуки, которые цепляют с первой секунды.",
                    gradient: "from-purple-500/20 to-blue-600/5",
                    colSpan: "md:col-span-2",
                    stat: "98% Удержание"
                },
                {
                    icon: Clock,
                    title: "Готово за 5 Минут",
                    desc: "От идеи до 30 готовых видео за время, пока варится кофе.",
                    gradient: "from-cyan-500/20 to-teal-600/5",
                    colSpan: "md:col-span-1"
                },
                {
                    icon: Layers,
                    title: "30 Уникальных Вариаций",
                    desc: "Никогда не постите одно и то же. Движок меняет углы, хуки и видеоряд.",
                    gradient: "from-emerald-500/20 to-green-600/5",
                    colSpan: "md:col-span-1"
                },
                {
                    icon: Globe2,
                    title: "Умный Сток",
                    desc: "Доступ к 5M+ премиум ассетов, автоматически подобранных под контекст.",
                    gradient: "from-orange-500/20 to-amber-600/5",
                    colSpan: "md:col-span-2",
                    stat: "4K Качество"
                },
                {
                    icon: Languages,
                    title: "Глобальный Охват",
                    desc: "Мгновенный перевод и даббинг на 20+ языков.",
                    gradient: "from-pink-500/20 to-rose-600/5",
                    colSpan: "md:col-span-1"
                },
                {
                    icon: FileVideo,
                    title: "Авто-Монтаж",
                    desc: "Идеальные склейки, переходы и динамичные субтитры без усилий.",
                    gradient: "from-blue-500/20 to-indigo-600/5",
                    colSpan: "md:col-span-2"
                }
            ]
        }
    };

    const c = content[lang];

    return (
        <section id="features" className="py-32 px-6 relative border-t border-white/5 overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-mono tracking-widest text-white/60">{c.badge}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-xl">
                        {c.title}
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        {c.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {c.features.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ feature, index }: { feature: any, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn(
                "group relative rounded-3xl p-8 border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/20 hover:scale-[1.01] hover:shadow-2xl",
                feature.colSpan
            )}
        >
            {/* Gradient Overlay */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", feature.gradient)} />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                        <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:translate-x-1 transition-transform">{feature.title}</h3>
                    <p className="text-white/50 leading-relaxed font-light">{feature.desc}</p>
                </div>

                {feature.stat && (
                    <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-white/80">{feature.stat}</span>
                    </div>
                )}
            </div>

            {/* Decorative Noise */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}></div>
        </motion.div>
    );
}
