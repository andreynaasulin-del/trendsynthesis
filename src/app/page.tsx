"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Pricing } from "@/components/landing/Pricing";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "ru">("en");
  const [demoState, setDemoState] = useState<"idle" | "parsing" | "synthesis" | "done">("idle");
  const [parsingProgress, setParsingProgress] = useState(0);
  const [synthesisProgress, setSynthesisProgress] = useState(0);

  // Translations
  const t = {
    en: {
      nav: { work: "Workflow", feat: "Features", price: "Pricing", demo: "Platform", start: "START" },
      hero: {
        badge: "SYSTEM READY",
        title1: "One topic -",
        title2: "30 viral videos",
        sub: "Upload one topic and get ready-made videos for TikTok and Reels",
        subHighlight: "in 5 minutes, no editor and no bans",
        cta: "TRY FOR FREE",
        demo: "Watch demo",
        stats: { v: "videos created", u: "users", w: "views" },
        terminal: {
          status: "SYSTEM ONLINE",
          velocity: "TREND VELOCITY",
          audience: "AUDIENCE MATCH",
          audienceVal: "HIGH",
          virality: "VIRALITY SCORE",
          logs: [
            "> Scanning TikTok API...",
            "> Found 12 rising hooks",
            "> Analyzing semantic structures...",
            "> GENERATING SCENARIOS..."
          ]
        }
      },
      demo: {
        sectionLabel: "INTERACTIVE DEMO",
        sectionTitle: "Experience the speed",
        title: "system.trendsynthesis.app",
        label: "THEME:",
        val: '"Why SMM-agencies die"',
        btn: "GENERATE",
        parsing: "NEURAL PARSING",
        synth: "VISUAL SYNTHESIS",
        done: "VIDEOS READY",
        action: "START FULL CYCLE"
      }
    },
    ru: {
      nav: { work: "Как работает", feat: "Возможности", price: "Цены", demo: "Демо", start: "НАЧАТЬ" },
      hero: {
        badge: "СИСТЕМА ГОТОВА",
        title1: "Одна тема -",
        title2: "30 вирусных видео",
        sub: "Загрузи одну тему и получи готовые ролики для TikTok и Reels",
        subHighlight: "за 5 минут, без монтажера и без банов",
        cta: "ПОПРОБОВАТЬ БЕСПЛАТНО",
        demo: "Смотреть демо",
        stats: { v: "видео создано", u: "пользователей", w: "просмотров" },
        terminal: {
          status: "СИСТЕМА В СЕТИ",
          velocity: "СКОРОСТЬ ТРЕНДА",
          audience: "СОВПАДЕНИЕ АУДИТОРИИ",
          audienceVal: "ВЫСОКОЕ",
          virality: "ВИРУСНЫЙ ПОТЕНЦИАЛ",
          logs: [
            "> Сканирование TikTok API...",
            "> Найдено 12 растущих хуков",
            "> Анализ семантических структур...",
            "> ГЕНЕРАЦИЯ СЦЕНАРИЕВ..."
          ]
        }
      },
      demo: {
        sectionLabel: "ИНТЕРАКТИВНОЕ ДЕМО",
        sectionTitle: "Почувствуй скорость",
        title: "system.trendsynthesis.app",
        label: "ТЕМА:",
        val: '"Почему SMM-агентства умирают"',
        btn: "СГЕНЕРИРОВАТЬ",
        parsing: "НЕЙРО-АНАЛИЗ",
        synth: "ВИЗУАЛЬНЫЙ СИНТЕЗ",
        done: "ВИДЕО ГОТОВЫ",
        action: "ЗАПУСТИТЬ ЦИКЛ"
      }
    }
  };

  const currentT = t[lang];

  const runDemo = () => {
    setDemoState("parsing");
    setParsingProgress(0);
    setSynthesisProgress(0);

    // Simulate Parsing
    let p = 0;
    const intervalP = setInterval(() => {
      p += 2;
      setParsingProgress(p);
      if (p >= 100) {
        clearInterval(intervalP);
        setDemoState("synthesis");

        // Simulate Synthesis
        let s = 0;
        const intervalS = setInterval(() => {
          s += 1;
          setSynthesisProgress(s);
          if (s >= 100) {
            clearInterval(intervalS);
            setDemoState("done");
          }
        }, 30);
      }
    }, 30);
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-white/20 overflow-x-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <Image
          src="/bg-luxe.png"
          alt="Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505] pointer-events-none" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 flex justify-between items-center">
          <div className="font-bold text-xl tracking-tighter">
            <span>TREND</span><span className="text-white/40">SYNTHESIS</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
            <a href="#how-it-works" className="hover:text-white transition-colors">{currentT.nav.work}</a>
            <a href="#features" className="hover:text-white transition-colors">{currentT.nav.feat}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{currentT.nav.price}</a>
            <a href="#demo" className="hover:text-white transition-colors">{currentT.nav.demo}</a>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex text-xs font-bold tracking-widest cursor-pointer">
              <span onClick={() => setLang("ru")} className={lang === "ru" ? "text-white" : "text-white/30"}>RU</span>
              <span className="mx-2 text-white/20">/</span>
              <span onClick={() => setLang("en")} className={lang === "en" ? "text-white" : "text-white/30"}>EN</span>
            </div>
            <a href="/dashboard" className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform cursor-pointer">
              {currentT.nav.start}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3 py-1 mb-8">
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
              <span className="text-[10px] font-mono tracking-widest text-white/60">{currentT.hero.badge}</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold leading-[0.9] tracking-tighter mb-6">
              {currentT.hero.title1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                {currentT.hero.title2}
              </span>
            </h1>

            <p className="text-lg text-white/50 max-w-md leading-relaxed mb-10">
              {currentT.hero.sub} <br />
              <span className="text-white font-medium">{currentT.hero.subHighlight}</span>
            </p>

            <div className="flex gap-4 mb-16">
              <Link href="/dashboard" className="bg-white text-black h-12 px-6 rounded-lg font-bold flex items-center gap-3 hover:bg-gray-200 transition-colors">
                <Play fill="currentColor" size={14} />
                {currentT.hero.cta}
              </Link>
              <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 px-6 rounded-lg font-medium border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                {currentT.hero.demo}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-8 border-t border-white/5 pt-8">
              <div>
                <div className="text-2xl font-bold">2,400+</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{currentT.hero.stats.v}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{currentT.hero.stats.u}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-bold">12M+</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{currentT.hero.stats.w}</div>
              </div>
            </div>
          </div>

          {/* Right Demo Preview */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-1 shadow-2xl">
              <div className="bg-black/40 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="text-[10px] font-mono text-white/30">{currentT.demo.title}</div>
                </div>

                <div className="font-mono text-sm mb-8 flex gap-4">
                  <span className="text-white/40">{currentT.demo.label}</span>
                  <span className="text-white">{currentT.demo.val}</span>
                </div>

                {/* Advanced AI Visual Interface */}
                <div className="relative z-10 space-y-4 mb-6">
                  {/* Status Header */}
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/5 pb-2 mb-4">
                    <span className="text-green-400 animate-pulse">● {currentT.hero.terminal?.status || "SYSTEM ONLINE"}</span>
                    <span className="text-white/30">V.3.4.0</span>
                  </div>

                  {/* Analysis Nodes */}
                  <div className="space-y-3">
                    {[
                      { label: currentT.hero.terminal?.velocity || "TREND VELOCITY", val: "98.4%", color: "bg-purple-500" },
                      { label: currentT.hero.terminal?.audience || "AUDIENCE MATCH", val: currentT.hero.terminal?.audienceVal || "HIGH", color: "bg-blue-500" },
                      { label: currentT.hero.terminal?.virality || "VIRALITY SCORE", val: "9.8/10", color: "bg-emerald-500" }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] ${item.color} ${i === 0 ? 'animate-ping' : ''}`} />
                          <span className="text-[10px] font-mono text-white/50 tracking-wider">{item.label}</span>
                        </div>
                        <div className="font-mono text-xs font-bold text-white group-hover:scale-105 transition-transform">
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Terminal Log */}
                  <div className="mt-4 h-24 bg-black/40 rounded-lg p-3 font-mono text-[10px] text-green-400/80 overflow-hidden border border-white/5 flex flex-col justify-end">
                    <div className="space-y-1 opacity-70">
                      {(currentT.hero.terminal?.logs || ["> Scanning TikTok API..."]).map((log, i) => (
                        <div key={i} className={i === 3 ? "text-white animate-pulse" : ""}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="h-0.5 bg-white/10 w-full mb-2 overflow-hidden">
                  <div className="h-full bg-white w-2/3 shadow-[0_0_10px_white]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* DEMO INTERACTIVE SECTION */}
      <section id="demo" className="py-32 relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-mono tracking-widest mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              {currentT.demo.sectionLabel}
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-2xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                {currentT.demo.sectionTitle}
              </span>
            </h2>
          </div>

          {/* Main Interface Module */}
          <div className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl ring-1 ring-white/5 transition-transform duration-500 hover:scale-[1.002]">

              {/* Noise Texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}></div>

              {/* Controls - Spotlight Style */}
              <div className={`relative z-20 transition-all duration-500 ${demoState !== 'idle' ? 'opacity-50 pointer-events-none grayscale blur-sm' : ''}`}>
                <div className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 border border-white/10 rounded-3xl md:rounded-full backdrop-blur-md shadow-lg group-hover:border-white/20 transition-colors">
                  <div className="flex-1 flex items-center px-6 py-4 md:py-2">
                    <span className="text-white/40 mr-4 font-mono text-xs tracking-widest border-r border-white/10 pr-4 h-6 flex items-center select-none">{currentT.demo.label}</span>
                    <input
                      type="text"
                      disabled={demoState !== 'idle'}
                      defaultValue={currentT.demo.val.replace(/"/g, '')}
                      className="flex-1 bg-transparent border-none text-white text-lg font-medium focus:outline-none placeholder:text-white/20 w-full caret-purple-500"
                    />
                  </div>
                  <button
                    onClick={runDemo}
                    disabled={demoState !== 'idle'}
                    className={`
                      px-8 py-4 md:py-3 rounded-2xl md:rounded-full font-bold transition-all relative overflow-hidden group/btn flex items-center justify-center
                      ${demoState === 'idle'
                        ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]'
                        : 'bg-white/10 text-white cursor-wait border border-white/10'}
                    `}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {demoState === 'idle' ? (
                        <>
                          {currentT.demo.btn} <ArrowRight size={16} />
                        </>
                      ) : (
                        <>
                          <span className="animate-spin">⟳</span>
                          PROCESSING...
                        </>
                      )}
                    </span>
                    {demoState === 'idle' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    )}
                  </button>
                </div>
              </div>

              {/* Parsing / Synthesis UI (Loading State) */}
              {(demoState === 'parsing' || demoState === 'synthesis') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                  <div className="relative w-40 h-40 mb-8">
                    {/* Spinner Rings */}
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin reverse duration-1000 opacity-70"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-bold tracking-tighter">
                      {parsingProgress < 100 ? parsingProgress : synthesisProgress}<span className="text-sm align-top ml-1">%</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-center animate-pulse">
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                      {parsingProgress < 100 ? currentT.demo.parsing : currentT.demo.synth}
                    </h3>
                    <p className="text-white/50 text-sm font-mono tracking-wider uppercase">
                      {parsingProgress < 100 ? "> Analyzing semantic patterns" : "> Rendering 4K assets"}
                    </p>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {demoState === 'done' && (
                <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {(lang === 'en' ? [
                      { hook: "3 ERRORs that kill Agencies", views: "1.2M", image: "https://images.unsplash.com/photo-1664575602554-208c7a264360?q=80&w=800&auto=format&fit=crop" },
                      { hook: "No Clients? Do THIS", views: "850K", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
                      { hook: "Secret Algorithm Hack", views: "2.4M", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" }
                    ] : [
                      { hook: "3 ОШИБКИ SMM-агентств", views: "1.2M", image: "https://images.unsplash.com/photo-1664575602554-208c7a264360?q=80&w=800&auto=format&fit=crop" },
                      { hook: "Нет клиентов? Делай ЭТО", views: "850K", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
                      { hook: "Секретный Хак Алгоритмов", views: "2.4M", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" }
                    ]).map((video, n) => (
                      <div key={n} className="aspect-[9/16] relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-white/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-black/40">
                        {/* Stock Background Image */}
                        <div className="absolute inset-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={video.image}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                        </div>

                        {/* Fake Video Content */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                            <Play fill="white" size={20} className="ml-1" />
                          </div>
                        </div>

                        {/* Top Badge */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 shadow-lg translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                          <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            9{8 - n}% VIRAL
                          </span>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
                          <div className="flex items-center gap-2 mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20" />
                            <div className="text-[10px] font-mono text-white/80 tracking-widest">HOOK_0{n + 1}</div>
                          </div>
                          <div className="text-sm font-bold leading-snug mb-3 text-white shadow-black drop-shadow-md line-clamp-2 group-hover:text-white transition-colors">
                            &quot;{video.hook}&quot;
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/90 bg-white/10 px-2.5 py-1.5 rounded-full w-fit backdrop-blur-sm border border-white/5 group-hover:bg-white/20 transition-colors">
                            <Play size={8} fill="currentColor" />
                            <span>{video.views}</span>
                          </div>
                        </div>

                        {/* Progress Line */}
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: '45%' }} />
                        </div>
                      </div>
                    ))}

                    {/* More Placeholder */}
                    <div className="aspect-[9/16] bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                        <span className="text-2xl font-bold text-white/70 group-hover:text-white">+</span>
                      </div>
                      <span className="text-3xl font-bold mb-1 group-hover:scale-105 transition-transform text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">27</span>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 group-hover:text-white/60 transition-colors">{currentT.demo.done}</span>
                    </div>
                  </div>

                  <div className="text-center relative z-20">
                    <Link href="/dashboard" className="inline-flex items-center gap-3 bg-white text-black font-bold px-10 py-5 rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] group">
                      <span>{currentT.demo.action}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks lang={lang} />

      {/* FEATURES */}
      <Features lang={lang} />

      {/* PRICING */}
      <Pricing lang={lang} />

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-mono text-sm">
              <span className="font-bold">TREND</span><span className="text-white/40">SYNTHESIS</span>
            </div>
            <div className="flex gap-6 text-sm text-white/40">
              <a href="#how-it-works" className="hover:text-white transition-colors">{lang === 'ru' ? 'Как работает' : 'How It Works'}</a>
              <a href="#features" className="hover:text-white transition-colors">{lang === 'ru' ? 'Возможности' : 'Features'}</a>
              <a href="#pricing" className="hover:text-white transition-colors">{lang === 'ru' ? 'Цены' : 'Pricing'}</a>
            </div>
            <div className="text-white/20 text-xs">
              © 2026 TRENDSYNTHESIS. {lang === 'ru' ? 'Все системы работают.' : 'All systems operational.'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
