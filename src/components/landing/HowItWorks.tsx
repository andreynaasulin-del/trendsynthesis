"use client";

import { motion } from "framer-motion";
import { MessageSquare, Brain, Film, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

interface HowItWorksProps {
    lang: "en" | "ru";
}

export function HowItWorks({ lang }: HowItWorksProps) {
    const content = {
        en: {
            badge: "WORKFLOW",
            title: "How It Works",
            subtitle: "From idea to 30 viral videos in 4 simple steps",
            cta: "Start Now",
            steps: [
                {
                    icon: MessageSquare,
                    step: "01",
                    title: "Describe Your Topic",
                    desc: "Tell the AI what you want to create content about. One sentence is enough.",
                    highlight: "Natural language input"
                },
                {
                    icon: Brain,
                    step: "02",
                    title: "AI Analysis",
                    desc: "GPT-4o analyzes trends, generates scripts, hooks, and 30 unique angles.",
                    highlight: "30 script variations"
                },
                {
                    icon: Film,
                    step: "03",
                    title: "Auto Assembly",
                    desc: "System finds matching stock footage and assembles videos with subtitles.",
                    highlight: "Dynamic editing"
                },
                {
                    icon: Rocket,
                    step: "04",
                    title: "Download & Post",
                    desc: "Get 30 ready-to-post vertical videos optimized for TikTok and Reels.",
                    highlight: "Ready in 5 min"
                }
            ]
        },
        ru: {
            badge: "ПРОЦЕСС",
            title: "Как это работает",
            subtitle: "От идеи до 30 вирусных видео за 4 простых шага",
            cta: "Начать",
            steps: [
                {
                    icon: MessageSquare,
                    step: "01",
                    title: "Опишите тему",
                    desc: "Расскажите ИИ о чём хотите создать контент. Одного предложения достаточно.",
                    highlight: "На естественном языке"
                },
                {
                    icon: Brain,
                    step: "02",
                    title: "AI Анализ",
                    desc: "GPT-4o анализирует тренды, генерирует скрипты, хуки и 30 уникальных углов.",
                    highlight: "30 вариаций скриптов"
                },
                {
                    icon: Film,
                    step: "03",
                    title: "Авто-Сборка",
                    desc: "Система находит подходящее видео и собирает ролики с субтитрами.",
                    highlight: "Динамичный монтаж"
                },
                {
                    icon: Rocket,
                    step: "04",
                    title: "Скачайте и публикуйте",
                    desc: "Получите 30 готовых вертикальных видео для TikTok и Reels.",
                    highlight: "Готово за 5 мин"
                }
            ]
        }
    };

    const c = content[lang];

    return (
        <section id="how-it-works" className="py-32 px-6 relative border-t border-white/5 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-6">
                        <span className="text-[10px] font-mono tracking-widest text-white/60">{c.badge}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {c.title}
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        {c.subtitle}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connection line */}
                    <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-emerald-500/20" />

                    {c.steps.map((step, i) => {
                        const Icon = step.icon;
                        const colors = [
                            "border-violet-500/30 bg-violet-500/10 text-violet-400",
                            "border-blue-500/30 bg-blue-500/10 text-blue-400",
                            "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                            "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        ];

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="text-center">
                                    {/* Step number */}
                                    <div className="relative inline-block mb-6">
                                        <div className={`w-16 h-16 rounded-2xl ${colors[i]} border flex items-center justify-center mb-2 mx-auto relative z-20 backdrop-blur-xl`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center z-30">
                                            {step.step}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed mb-3">{step.desc}</p>
                                    <span className="inline-block text-[10px] font-mono tracking-wider text-white/30 border border-white/10 rounded-full px-3 py-1">
                                        {step.highlight}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-16"
                >
                    <Link
                        href="/generate"
                        className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] group"
                    >
                        {c.cta}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
