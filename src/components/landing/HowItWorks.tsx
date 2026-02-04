"use client";

import { motion } from "framer-motion";
import { MessageSquare, Brain, Film, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
                    title: "Input Topic",
                    desc: "Just paste a topic or URL. Our AI understands context instantly.",
                    highlight: "Natural Language"
                },
                {
                    icon: Brain,
                    step: "02",
                    title: "Deep Analysis",
                    desc: "System scans 1M+ viral videos to find winning angles and scripts.",
                    highlight: "Strategic AI"
                },
                {
                    icon: Film,
                    step: "03",
                    title: "Auto-Production",
                    desc: "We match stock footage, add voiceovers, and sync subtitles.",
                    highlight: "Cinema Quality"
                },
                {
                    icon: Rocket,
                    step: "04",
                    title: "Viral Launch",
                    desc: "Download 30 videos optimized for the algorithm and start posting.",
                    highlight: "Ready to Scale"
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
                    title: "Ввод Темы",
                    desc: "Просто вставьте тему или ссылку. ИИ мгновенно поймет контекст.",
                    highlight: "Натуральный язык"
                },
                {
                    icon: Brain,
                    step: "02",
                    title: "Глубокий Анализ",
                    desc: "Система сканирует 1M+ вирусных видео для поиска лучших углов.",
                    highlight: "Стратегический AI"
                },
                {
                    icon: Film,
                    step: "03",
                    title: "Авто-Продакшн",
                    desc: "Мы подбираем стоки, добавляем озвучку и синхронизируем субтитры.",
                    highlight: "Кино-качество"
                },
                {
                    icon: Rocket,
                    step: "04",
                    title: "Вирусный Старт",
                    desc: "Скачивайте 30 видео, оптимизированных под алгоритмы.",
                    highlight: "Готово к масштабу"
                }
            ]
        }
    };

    const c = content[lang];

    return (
        <section id="how-it-works" className="py-32 px-6 relative border-t border-white/5 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-1/2 left-0 w-full h-[600px] bg-gradient-to-r from-violet-900/10 via-black to-violet-900/10 blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-6">
                        <span className="text-[10px] font-mono tracking-widest text-white/60">{c.badge}</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-xl">
                        {c.title}
                    </h2>
                    <p className="text-white/40 text-lg max-w-xl mx-auto">
                        {c.subtitle}
                    </p>
                </div>

                <div className="relative">
                    {/* Central Line */}
                    <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 md:translate-x-0">
                        <div className="absolute top-0 bottom-0 w-full bg-gradient-to-b from-transparent via-violet-500 to-transparent opacity-50" />
                    </div>

                    <div className="space-y-12 md:space-y-24">
                        {c.steps.map((step, i) => {
                            const isEven = i % 2 === 0;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className={cn(
                                        "relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16",
                                        isEven ? "" : "md:flex-row-reverse"
                                    )}
                                >
                                    {/* Icon / Marker */}
                                    <div className="absolute left-[28px] md:left-1/2 w-14 h-14 -translate-x-1/2 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center z-20 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                            <step.icon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>

                                    {/* Content Card Side */}
                                    <div className={cn(
                                        "ml-20 md:ml-0 md:w-1/2",
                                        isEven ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                                    )}>
                                        <div className="relative group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md">
                                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-110 transition-transform">
                                                {step.step}
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-white">{step.title}</h3>
                                            <p className="text-white/50 text-sm leading-relaxed mb-4">{step.desc}</p>
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider font-bold text-white/70",
                                                isEven ? "md:mr-0" : ""
                                            )}>
                                                {step.highlight}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Empty Side for balance */}
                                    <div className="hidden md:block md:w-1/2" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-24"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-3 bg-white text-black font-bold px-10 py-5 rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] group"
                    >
                        {c.cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
