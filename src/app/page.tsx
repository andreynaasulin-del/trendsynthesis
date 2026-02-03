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
        stats: { v: "videos created", u: "users", w: "views" }
      },
      demo: {
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
        stats: { v: "видео создано", u: "пользователей", w: "просмотров" }
      },
      demo: {
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
    <div className="min-h-screen text-white font-sans selection:bg-white/20">
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
                    <span className="text-green-400 animate-pulse">● SYSTEM ONLINE</span>
                    <span className="text-white/30">V.3.4.0</span>
                  </div>

                  {/* Analysis Nodes */}
                  <div className="space-y-3">
                    {[
                      { label: "TREND VELOCITY", val: "98.4%", color: "bg-purple-500" },
                      { label: "AUDIENCE MATCH", val: "HIGH", color: "bg-blue-500" },
                      { label: "VIRALITY SCORE", val: "9.8/10", color: "bg-emerald-500" }
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
                      <div>&gt; Scanning TikTok API...</div>
                      <div>&gt; Found 12 rising hooks</div>
                      <div>&gt; Analyzing semantic structures...</div>
                      <div className="text-white animate-pulse">&gt; GENERATING SCENARIOS...</div>
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
      <section id="demo" className="py-32 border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-purple-400 mb-4 tracking-widest">INTERACTIVE DEMO</div>
            <h2 className="text-4xl font-bold">Experience the speed</h2>
          </div>

          <div className="bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-white/5">

            {/* Controls */}
            <div className={`transition-all duration-500 ${demoState !== 'idle' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  disabled={demoState !== 'idle'}
                  defaultValue={currentT.demo.val.replace(/"/g, '')}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                />
                <button
                  onClick={runDemo}
                  disabled={demoState !== 'idle'}
                  className={`
                    px-8 py-4 rounded-xl font-bold transition-all relative overflow-hidden group
                    ${demoState === 'idle'
                      ? 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]'
                      : 'bg-white/10 text-white cursor-wait border border-white/10'}
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {demoState === 'idle' ? (
                      currentT.demo.btn
                    ) : (
                      <>
                        <span className="animate-spin">⟳</span>
                        PROCESSING...
                      </>
                    )}
                  </span>
                  {demoState !== 'idle' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Progress State */}
            {(demoState === 'parsing' || demoState === 'synthesis') && (
              <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Parsing Bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className={parsingProgress === 100 ? 'text-green-400' : 'text-white/60'}>
                      {currentT.demo.parsing} {parsingProgress === 100 && '✓'}
                    </span>
                    <span>{parsingProgress}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-75 ease-out" style={{ width: `${parsingProgress}%` }} />
                  </div>
                </div>

                {/* Synthesis Bar */}
                <div className={`transition-opacity duration-500 ${demoState === 'parsing' ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className={synthesisProgress === 100 ? 'text-green-400' : 'text-white/60'}>
                      {currentT.demo.synth} {synthesisProgress === 100 && '✓'}
                    </span>
                    <span>{synthesisProgress}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-75 ease-out" style={{ width: `${synthesisProgress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {demoState === 'done' && (
              <div className="mt-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {(lang === 'en' ? [
                    { hook: "3 ERRORs that kill Agencies", views: "1.2M", color: "from-pink-500 to-rose-500" },
                    { hook: "No Clients? Do THIS", views: "850K", color: "from-violet-500 to-purple-500" },
                    { hook: "Secret Algorithm Hack", views: "2.4M", color: "from-blue-500 to-cyan-500" }
                  ] : [
                    { hook: "3 ОШИБКИ SMM-агентств", views: "1.2M", color: "from-pink-500 to-rose-500" },
                    { hook: "Нет клиентов? Делай ЭТО", views: "850K", color: "from-violet-500 to-purple-500" },
                    { hook: "Секретный Хак Алгоритмов", views: "2.4M", color: "from-blue-500 to-cyan-500" }
                  ]).map((video, n) => (
                    <div key={n} className="aspect-[9/16] relative rounded-xl overflow-hidden group cursor-pointer border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${video.color} opacity-20 group-hover:opacity-30 transition-opacity`} />

                      {/* Fake Video Content */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                          <Play fill="white" size={16} />
                        </div>
                      </div>

                      {/* UI Elements */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/5 shadow-lg">
                        <span className="text-[10px] font-bold text-green-400">9{8 - n}% VIRAL</span>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10" />
                          <div className="text-[10px] font-mono text-white/60 tracking-widest">HOOK_0{n + 1}</div>
                        </div>
                        <div className="text-sm font-bold leading-snug mb-2 text-white shadow-black drop-shadow-md line-clamp-2">
                          &quot;{video.hook}&quot;
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/80 bg-white/5 px-2 py-1 rounded-full w-fit backdrop-blur-sm border border-white/5">
                          <Play size={8} fill="currentColor" />
                          <span>{video.views}</span>
                        </div>
                      </div>

                      {/* Fake Progress Bar */}
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
                        <div className="h-full bg-white/80" style={{ width: '35%' }} />
                      </div>
                    </div>
                  ))}
                  <div className="aspect-[9/16] bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-white/10 transition-colors group">
                    <span className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">+27</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">{currentT.demo.done}</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/dashboard" className="inline-block bg-white text-black font-bold px-10 py-4 rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    {currentT.demo.action}
                  </Link>
                </div>
              </div>
            )}

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
