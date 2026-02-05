"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

const Pricing = dynamic(() => import("@/components/landing/Pricing").then((mod) => mod.Pricing));
const Features = dynamic(() => import("@/components/landing/Features").then((mod) => mod.Features));
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks").then((mod) => mod.HowItWorks));

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "ru">("ru");
  const [demoState, setDemoState] = useState<"idle" | "parsing" | "synthesis" | "done">("idle");
  const [parsingProgress, setParsingProgress] = useState(0);
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        cta: "TRY FREE",
        demo: "Demo",
        stats: { v: "videos", u: "users", w: "views" },
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
        sectionLabel: "DEMO",
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
        cta: "БЕСПЛАТНО",
        demo: "Демо",
        stats: { v: "видео", u: "юзеров", w: "просмотров" },
        terminal: {
          status: "СИСТЕМА В СЕТИ",
          velocity: "СКОРОСТЬ ТРЕНДА",
          audience: "АУДИТОРИЯ",
          audienceVal: "ВЫСОКОЕ",
          virality: "ВИРУСНОСТЬ",
          logs: [
            "> Сканирование TikTok API...",
            "> Найдено 12 растущих хуков",
            "> Анализ семантических структур...",
            "> ГЕНЕРАЦИЯ СЦЕНАРИЕВ..."
          ]
        }
      },
      demo: {
        sectionLabel: "ДЕМО",
        sectionTitle: "Почувствуй скорость",
        title: "system.trendsynthesis.app",
        label: "ТЕМА:",
        val: '"Почему SMM-агентства умирают"',
        btn: "СГЕНЕРИРОВАТЬ",
        parsing: "НЕЙРО-АНАЛИЗ",
        synth: "ВИЗУАЛЬНЫЙ СИНТЕЗ",
        done: "ГОТОВЫ",
        action: "ЗАПУСТИТЬ"
      }
    }
  };

  const currentT = t[lang];

  const runDemo = () => {
    setDemoState("parsing");
    setParsingProgress(0);
    setSynthesisProgress(0);

    let p = 0;
    const intervalP = setInterval(() => {
      p += 2;
      setParsingProgress(p);
      if (p >= 100) {
        clearInterval(intervalP);
        setDemoState("synthesis");

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
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-14 sm:h-16 flex justify-between items-center">
          <div className="font-bold text-lg sm:text-xl tracking-tighter">
            <span>TREND</span><span className="text-white/40">SYNTHESIS</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 text-sm font-medium text-white/60">
            <a href="#how-it-works" className="hover:text-white transition-colors">{currentT.nav.work}</a>
            <a href="#features" className="hover:text-white transition-colors">{currentT.nav.feat}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{currentT.nav.price}</a>
            <a href="#demo" className="hover:text-white transition-colors">{currentT.nav.demo}</a>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* Language Toggle */}
            <div className="flex text-[10px] sm:text-xs font-bold tracking-widest cursor-pointer">
              <span onClick={() => setLang("ru")} className={lang === "ru" ? "text-white" : "text-white/30"}>RU</span>
              <span className="mx-1.5 sm:mx-2 text-white/20">/</span>
              <span onClick={() => setLang("en")} className={lang === "en" ? "text-white" : "text-white/30"}>EN</span>
            </div>

            {/* CTA Button */}
            <a href="/dashboard" className="hidden sm:block bg-white text-black px-4 sm:px-5 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">
              {currentT.nav.start}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#050505]/95 backdrop-blur-lg border-b border-white/5">
            <div className="flex flex-col p-4 gap-4">
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-white/70 py-2">{currentT.nav.work}</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-white/70 py-2">{currentT.nav.feat}</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-white/70 py-2">{currentT.nav.price}</a>
              <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="text-white/70 py-2">{currentT.nav.demo}</a>
              <a href="/dashboard" className="bg-white text-black py-3 rounded-lg text-center font-bold mt-2">
                {currentT.nav.start}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-20 sm:pt-32 lg:pt-40 pb-12 sm:pb-24 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-3 py-1 mb-6 sm:mb-8">
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
              <span className="text-[10px] font-mono tracking-widest text-white/60">{currentT.hero.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tighter mb-4 sm:mb-6">
              {currentT.hero.title1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
                {currentT.hero.title2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-md mx-auto lg:mx-0 leading-relaxed mb-8 sm:mb-10">
              {currentT.hero.sub} <br />
              <span className="text-white font-medium">{currentT.hero.subHighlight}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-16 justify-center lg:justify-start">
              <Link href="/dashboard" className="bg-white text-black h-12 sm:h-12 px-6 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors">
                <Play fill="currentColor" size={14} />
                {currentT.hero.cta}
              </Link>
              <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 px-6 rounded-lg font-medium border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                {currentT.hero.demo}
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Stats - Compact on mobile */}
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 border-t border-white/5 pt-6 sm:pt-8">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">2,400+</div>
                <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">{currentT.hero.stats.v}</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">156</div>
                <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">{currentT.hero.stats.u}</div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">12M+</div>
                <div className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">{currentT.hero.stats.w}</div>
              </div>
            </div>
          </div>

          {/* Right Demo Preview - Hidden on small mobile */}
          <div className="relative group hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden p-1 shadow-2xl">
              <div className="bg-black/40 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-white/5 pb-3 sm:pb-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/20" />
                    <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-white/30">{currentT.demo.title}</div>
                </div>

                <div className="font-mono text-xs sm:text-sm mb-6 sm:mb-8 flex gap-2 sm:gap-4 flex-wrap">
                  <span className="text-white/40">{currentT.demo.label}</span>
                  <span className="text-white text-xs sm:text-sm">{currentT.demo.val}</span>
                </div>

                {/* Analysis Nodes */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {[
                    { label: currentT.hero.terminal?.velocity || "TREND VELOCITY", val: "98.4%", color: "bg-purple-500" },
                    { label: currentT.hero.terminal?.audience || "AUDIENCE MATCH", val: currentT.hero.terminal?.audienceVal || "HIGH", color: "bg-blue-500" },
                    { label: currentT.hero.terminal?.virality || "VIRALITY SCORE", val: "9.8/10", color: "bg-emerald-500" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-2.5 sm:p-3 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] ${item.color} ${i === 0 ? 'animate-ping' : ''}`} />
                        <span className="text-[9px] sm:text-[10px] font-mono text-white/50 tracking-wider">{item.label}</span>
                      </div>
                      <div className="font-mono text-[10px] sm:text-xs font-bold text-white">
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Terminal Log */}
                <div className="h-20 sm:h-24 bg-black/40 rounded-lg p-2 sm:p-3 font-mono text-[9px] sm:text-[10px] text-green-400/80 overflow-hidden border border-white/5 flex flex-col justify-end">
                  <div className="space-y-0.5 sm:space-y-1 opacity-70">
                    {(currentT.hero.terminal?.logs || ["> Scanning TikTok API..."]).map((log, i) => (
                      <div key={i} className={i === 3 ? "text-white animate-pulse" : ""}>{log}</div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-0.5 bg-white/10 w-full mt-3 sm:mt-4 overflow-hidden">
                  <div className="h-full bg-white w-2/3 shadow-[0_0_10px_white]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* DEMO INTERACTIVE SECTION */}
      <section id="demo" className="py-12 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[1000px] h-[400px] sm:h-[600px] bg-purple-600/20 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-mono tracking-widest mb-4 sm:mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              {currentT.demo.sectionLabel}
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                {currentT.demo.sectionTitle}
              </span>
            </h2>
          </div>

          {/* Main Interface Module */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl sm:rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 overflow-hidden shadow-2xl">

              {/* Controls */}
              <div className={`relative z-20 transition-all duration-500 ${demoState !== 'idle' ? 'opacity-50 pointer-events-none grayscale blur-sm' : ''}`}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-2 bg-white/5 border border-white/10 rounded-xl sm:rounded-full backdrop-blur-md">
                  <div className="flex-1 flex items-center px-4 sm:px-6 py-3 sm:py-2">
                    <span className="hidden sm:flex text-white/40 mr-4 font-mono text-xs tracking-widest border-r border-white/10 pr-4 h-6 items-center select-none">{currentT.demo.label}</span>
                    <input
                      type="text"
                      disabled={demoState !== 'idle'}
                      defaultValue={currentT.demo.val.replace(/"/g, '')}
                      className="flex-1 bg-transparent border-none text-white text-sm sm:text-lg font-medium focus:outline-none placeholder:text-white/20 w-full"
                    />
                  </div>
                  <button
                    onClick={runDemo}
                    disabled={demoState !== 'idle'}
                    className={`
                      px-6 sm:px-8 py-3 sm:py-3 rounded-xl sm:rounded-full font-bold transition-all flex items-center justify-center gap-2
                      ${demoState === 'idle'
                        ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-white/10 text-white cursor-wait border border-white/10'}
                    `}
                  >
                    {demoState === 'idle' ? (
                      <>
                        {currentT.demo.btn} <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        <span className="animate-spin">⟳</span>
                        <span className="hidden sm:inline">PROCESSING...</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {(demoState === 'parsing' || demoState === 'synthesis') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-4">
                  <div className="relative w-28 sm:w-40 h-28 sm:h-40 mb-6 sm:mb-8">
                    <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-t-transparent border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin opacity-70"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold">
                      {parsingProgress < 100 ? parsingProgress : synthesisProgress}<span className="text-xs sm:text-sm align-top ml-1">%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                      {parsingProgress < 100 ? currentT.demo.parsing : currentT.demo.synth}
                    </h3>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {demoState === 'done' && (
                <div className="mt-8 sm:mt-16 relative z-10">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
                    {(lang === 'en' ? [
                      { hook: "3 ERRORs that kill Agencies", views: "1.2M", image: "https://images.unsplash.com/photo-1664575602554-208c7a264360?q=80&w=800&auto=format&fit=crop" },
                      { hook: "No Clients? Do THIS", views: "850K", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
                      { hook: "Secret Algorithm Hack", views: "2.4M", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" }
                    ] : [
                      { hook: "3 ОШИБКИ SMM-агентств", views: "1.2M", image: "https://images.unsplash.com/photo-1664575602554-208c7a264360?q=80&w=800&auto=format&fit=crop" },
                      { hook: "Нет клиентов? Делай ЭТО", views: "850K", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" },
                      { hook: "Секретный Хак Алгоритмов", views: "2.4M", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" }
                    ]).map((video, n) => (
                      <div key={n} className="aspect-[9/16] relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <div className="absolute inset-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={video.image}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4">
                          <div className="text-[10px] sm:text-sm font-bold leading-snug mb-2 text-white line-clamp-2">
                            &quot;{video.hook}&quot;
                          </div>
                          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white/90 bg-white/10 px-2 py-1 rounded-full w-fit">
                            <Play size={8} fill="currentColor" />
                            <span>{video.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* More Placeholder */}
                    <div className="aspect-[9/16] bg-white/5 border-2 border-dashed border-white/10 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-2 sm:p-4">
                      <span className="text-2xl sm:text-3xl font-bold mb-1 text-white/70">+27</span>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-white/40">{currentT.demo.done}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 sm:gap-3 bg-white text-black font-bold px-6 sm:px-10 py-4 sm:py-5 rounded-full hover:scale-105 transition-all text-sm sm:text-base">
                      <span>{currentT.demo.action}</span>
                      <ArrowRight size={16} />
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
      <footer className="py-8 sm:py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-sm">
              <span className="font-bold">TREND</span><span className="text-white/40">SYNTHESIS</span>
            </div>
            <div className="flex gap-4 sm:gap-6 text-sm text-white/40">
              <Link href="/partners" className="hover:text-white transition-colors">{lang === 'ru' ? 'Партнёрам' : 'Partners'}</Link>
              <a href="mailto:hello@trendsynthesis.com" className="hover:text-white transition-colors">{lang === 'ru' ? 'Связаться' : 'Contact'}</a>
            </div>
            <div className="text-white/20 text-xs text-center sm:text-right">
              © 2026 TRENDSYNTHESIS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
