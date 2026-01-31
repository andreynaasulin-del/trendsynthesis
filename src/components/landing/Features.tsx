"use client";

import { motion } from "framer-motion";
import {
    Zap,
    Layers,
    Globe2,
    Shield,
    Clock,
    Sparkles,
    TrendingUp,
    FileVideo,
    Palette,
    Languages
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
                    title: "AI-Powered Scripts",
                    desc: "GPT-4o generates hooks, stories, and CTAs proven to go viral",
                    gradient: "from-violet-500/20 to-purple-600/5"
                },
                {
                    icon: FileVideo,
                    title: "Auto Video Assembly",
                    desc: "Dynamic cuts synced with subtitles for maximum retention",
                    gradient: "from-blue-500/20 to-cyan-600/5"
                },
                {
                    icon: Layers,
                    title: "30 Variations",
                    desc: "One topic generates 30 unique angles and formats",
                    gradient: "from-emerald-500/20 to-green-600/5"
                },
                {
                    icon: Globe2,
                    title: "Stock Library",
                    desc: "Access to millions of premium stock videos and images",
                    gradient: "from-orange-500/20 to-amber-600/5"
                },
                {
                    icon: Languages,
                    title: "Multi-Language",
                    desc: "Generate content in English, Russian, and more",
                    gradient: "from-pink-500/20 to-rose-600/5"
                },
                {
                    icon: Clock,
                    title: "5 Minute Delivery",
                    desc: "From idea to 30 ready-to-post videos in minutes",
                    gradient: "from-cyan-500/20 to-teal-600/5"
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
                    title: "AI-Скрипты",
                    desc: "GPT-4o генерирует хуки, истории и CTA для вирусного контента",
                    gradient: "from-violet-500/20 to-purple-600/5"
                },
                {
                    icon: FileVideo,
                    title: "Авто-Монтаж",
                    desc: "Динамичные склейки с субтитрами для максимального удержания",
                    gradient: "from-blue-500/20 to-cyan-600/5"
                },
                {
                    icon: Layers,
                    title: "30 Вариаций",
                    desc: "Одна тема — 30 уникальных углов и форматов",
                    gradient: "from-emerald-500/20 to-green-600/5"
                },
                {
                    icon: Globe2,
                    title: "Сток Библиотека",
                    desc: "Доступ к миллионам премиум видео и изображений",
                    gradient: "from-orange-500/20 to-amber-600/5"
                },
                {
                    icon: Languages,
                    title: "Мульти-Язык",
                    desc: "Генерация контента на русском, английском и др.",
                    gradient: "from-pink-500/20 to-rose-600/5"
                },
                {
                    icon: Clock,
                    title: "5 Минут",
                    desc: "От идеи до 30 готовых видео за минуты",
                    gradient: "from-cyan-500/20 to-teal-600/5"
                }
            ]
        }
    };

    const c = content[lang];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <section id="features" className="py-32 px-6 relative border-t border-white/5">
            {/* Background */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] font-mono tracking-widest text-white/60">{c.badge}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {c.title}
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        {c.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {c.features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="group relative rounded-2xl p-6 border border-white/10 bg-black/20 backdrop-blur-xl transition-all duration-300 hover:bg-white/5 hover:border-white/20 hover:translate-y-[-4px]"
                            >
                                {/* Gradient overlay */}
                                <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />

                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                                        <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
