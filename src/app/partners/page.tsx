"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  BarChart3,
  Globe,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Zap,
  CheckCircle,
  Gift,
  Percent,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    nav: {
      signIn: "Sign In",
      becomePartner: "Become a Partner",
    },
    hero: {
      badge: "Partner Program",
      title1: "Become a TRENDSYNTHESIS Partner",
      title2: "Earn 50% Lifetime",
      subtitle: "The most generous affiliate program in the AI niche. Promote the #1 Viral Video Generator and earn passive income",
      ctaStart: "Start Earning Now",
      ctaCalculate: "Calculate Earnings",
      stats: {
        commission: "Commission",
        duration: "Duration",
        minPayout: "Min Payout",
        lifetime: "Lifetime",
      },
    },
    valueProps: {
      title: "Why Partner With Us",
      subtitle: "Join hundreds of creators, agencies, and influencers earning passive income with TRENDSYNTHESIS",
      cards: [
        {
          title: "50% Commission",
          description: "Get half of every payment, forever. No caps, no limits. The highest rate in the industry",
        },
        {
          title: "Real-time Analytics",
          description: "Track every click, signup, and dollar in your personal dashboard. Full transparency",
        },
        {
          title: "Global Payouts",
          description: "Withdraw via Crypto (USDT) or Bank Card. Available worldwide, no minimum threshold",
        },
      ],
    },
    calculator: {
      badge: "PASSIVE INCOME",
      title: "Calculate Your Earnings",
      subtitle: "See how much you could earn with the TRENDSYNTHESIS Partner Program",
      calcBadge: "EARNINGS CALCULATOR",
      calcTitle: "How much can you earn",
      usersLabel: "Users you refer",
      monthly: "Monthly",
      yearly: "Yearly",
      formula: (users: number) => `Based on Pro plan ($29/mo) × 50% commission × ${users} users`,
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Three simple steps to start earning",
      steps: [
        {
          title: "Sign Up",
          description: "Create your free partner account and get your unique referral link instantly",
        },
        {
          title: "Share",
          description: "Promote TRENDSYNTHESIS to your audience via social media, blog, or direct links",
        },
        {
          title: "Earn",
          description: "Get 50% of every payment from users who sign up through your link. Forever",
        },
      ],
    },
    features: {
      title1: "Everything you need to succeed",
      list1: [
        "Instant link generation",
        "Real-time conversion tracking",
        "30-day cookie duration",
        "Dedicated partner support",
        "Marketing materials provided",
        "No approval needed — start instantly",
      ],
      title2: "Perfect for",
      list2: [
        "Content creators & influencers",
        "Marketing agencies",
        "YouTube reviewers",
        "Newsletter owners",
        "Social media managers",
        "Anyone with an audience",
      ],
    },
    cta: {
      title: "Ready to start earning",
      subtitle: "Join the TRENDSYNTHESIS Partner Program today and turn your audience into passive income",
      button: "Start Earning Now",
    },
    footer: {
      copyright: "© 2026 TRENDSYNTHESIS. All rights reserved",
      home: "Home",
      signIn: "Sign In",
    },
  },
  ru: {
    nav: {
      signIn: "Войти",
      becomePartner: "Стать партнёром",
    },
    hero: {
      badge: "Партнёрская программа",
      title1: "Стань партнёром TRENDSYNTHESIS",
      title2: "Получай 50% навсегда",
      subtitle: "Самая щедрая партнёрская программа в AI-нише. Продвигай #1 генератор вирусных видео и зарабатывай пассивный доход",
      ctaStart: "Начать зарабатывать",
      ctaCalculate: "Рассчитать доход",
      stats: {
        commission: "Комиссия",
        duration: "Срок",
        minPayout: "Мин. вывод",
        lifetime: "Навсегда",
      },
    },
    valueProps: {
      title: "Почему мы",
      subtitle: "Присоединяйся к сотням креаторов, агентств и инфлюенсеров, которые зарабатывают с TRENDSYNTHESIS",
      cards: [
        {
          title: "50% комиссия",
          description: "Получай половину каждого платежа навсегда. Без лимитов. Лучшая ставка в индустрии",
        },
        {
          title: "Аналитика в реальном времени",
          description: "Отслеживай каждый клик, регистрацию и доллар в личном кабинете. Полная прозрачность",
        },
        {
          title: "Глобальные выплаты",
          description: "Вывод через Крипто (USDT) или банковскую карту. Доступно по всему миру, без порога",
        },
      ],
    },
    calculator: {
      badge: "ПАССИВНЫЙ ДОХОД",
      title: "Рассчитай свой доход",
      subtitle: "Узнай, сколько можно заработать с партнёрской программой TRENDSYNTHESIS",
      calcBadge: "КАЛЬКУЛЯТОР ДОХОДА",
      calcTitle: "Сколько ты можешь заработать",
      usersLabel: "Приведённых пользователей",
      monthly: "В месяц",
      yearly: "В год",
      formula: (users: number) => `На основе Pro ($29/мес) × 50% комиссия × ${users} пользователей`,
    },
    howItWorks: {
      title: "Как это работает",
      subtitle: "Три простых шага для начала заработка",
      steps: [
        {
          title: "Регистрация",
          description: "Создай бесплатный партнёрский аккаунт и получи уникальную реферальную ссылку мгновенно",
        },
        {
          title: "Продвигай",
          description: "Рекламируй TRENDSYNTHESIS своей аудитории через соцсети, блог или прямые ссылки",
        },
        {
          title: "Зарабатывай",
          description: "Получай 50% с каждого платежа пользователей, которые пришли по твоей ссылке. Навсегда",
        },
      ],
    },
    features: {
      title1: "Всё для успеха",
      list1: [
        "Мгновенная генерация ссылок",
        "Отслеживание конверсий в реальном времени",
        "30-дневная длительность куки",
        "Выделенная поддержка партнёров",
        "Маркетинговые материалы",
        "Без одобрения — начни сразу",
      ],
      title2: "Идеально для",
      list2: [
        "Контент-мейкеров и инфлюенсеров",
        "Маркетинговых агентств",
        "YouTube-обзорщиков",
        "Владельцев рассылок",
        "SMM-менеджеров",
        "Всех, у кого есть аудитория",
      ],
    },
    cta: {
      title: "Готов начать зарабатывать",
      subtitle: "Присоединяйся к партнёрской программе TRENDSYNTHESIS и преврати свою аудиторию в пассивный доход",
      button: "Начать зарабатывать",
    },
    footer: {
      copyright: "© 2026 TRENDSYNTHESIS. Все права защищены",
      home: "Главная",
      signIn: "Войти",
    },
  },
};

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string }> = ({
  value,
  prefix = "",
  suffix = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tabular-nums"
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
};

// ============================================
// VALUE PROP CARD
// ============================================
const ValueCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}> = ({ icon: Icon, title, description, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl sm:rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
    <div className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all h-full">
      <div
        className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4",
          gradient
        )}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// ============================================
// EARNINGS CALCULATOR
// ============================================
const EarningsCalculator: React.FC<{ t: typeof translations.en.calculator }> = ({ t }) => {
  const [users, setUsers] = useState(50);
  const PRO_PRICE = 29;
  const COMMISSION_RATE = 0.5;

  const monthlyEarnings = Math.round(users * PRO_PRICE * COMMISSION_RATE);
  const yearlyEarnings = monthlyEarnings * 12;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative max-w-2xl mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-green-500/10 to-emerald-500/20 rounded-2xl sm:rounded-3xl blur-3xl" />

      <div className="relative p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-zinc-900/80 backdrop-blur-xl">
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3" />
            {t.calcBadge}
          </span>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {t.calcTitle}
          </h3>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs sm:text-sm text-zinc-400">{t.usersLabel}</span>
            <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
              {users}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={users}
            onChange={(e) => setUsers(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-emerald-500
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-emerald-500/50
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-6
              [&::-moz-range-thumb]:h-6
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-emerald-500
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-2">
            <span>10</span>
            <span>500</span>
            <span>1000</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <p className="text-[10px] sm:text-xs text-zinc-500 mb-1 uppercase tracking-wider">{t.monthly}</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400">
              <AnimatedCounter value={monthlyEarnings} prefix="$" />
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30">
            <p className="text-[10px] sm:text-xs text-emerald-400/70 mb-1 uppercase tracking-wider">{t.yearly}</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              <AnimatedCounter value={yearlyEarnings} prefix="$" />
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-zinc-500 mt-4 sm:mt-6 px-2">
          {t.formula(users)}
        </p>
      </div>
    </motion.div>
  );
};

// ============================================
// FEATURE LIST ITEM
// ============================================
const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-2 sm:gap-3">
    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
    <span className="text-sm sm:text-base text-zinc-300">{children}</span>
  </li>
);

// ============================================
// MAIN PAGE
// ============================================
export default function PartnersPage() {
  const [lang, setLang] = useState<"en" | "ru">("ru");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const stepIcons = [Users, TrendingUp, DollarSign];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                TRENDSYNTHESIS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex text-xs font-bold tracking-widest cursor-pointer bg-zinc-900 rounded-full px-1 py-1">
                <span
                  onClick={() => setLang("ru")}
                  className={cn(
                    "px-3 py-1 rounded-full transition-all",
                    lang === "ru" ? "bg-white text-black" : "text-white/50 hover:text-white"
                  )}
                >
                  RU
                </span>
                <span
                  onClick={() => setLang("en")}
                  className={cn(
                    "px-3 py-1 rounded-full transition-all",
                    lang === "en" ? "bg-white text-black" : "text-white/50 hover:text-white"
                  )}
                >
                  EN
                </span>
              </div>

              <Link
                href="/login?redirect=/partner"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {t.nav.signIn}
              </Link>
              <Link href="/login?redirect=/partner">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                  {t.nav.becomePartner}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Language Switcher Mobile */}
              <div className="flex text-xs font-bold tracking-widest cursor-pointer bg-zinc-900 rounded-full px-0.5 py-0.5">
                <span
                  onClick={() => setLang("ru")}
                  className={cn(
                    "px-2 py-1 rounded-full transition-all text-[10px]",
                    lang === "ru" ? "bg-white text-black" : "text-white/50"
                  )}
                >
                  RU
                </span>
                <span
                  onClick={() => setLang("en")}
                  className={cn(
                    "px-2 py-1 rounded-full transition-all text-[10px]",
                    lang === "en" ? "bg-white text-black" : "text-white/50"
                  )}
                >
                  EN
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-zinc-800"
            >
              <div className="flex flex-col gap-3">
                <Link
                  href="/login?redirect=/partner"
                  className="text-sm text-zinc-400 hover:text-white transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.nav.signIn}
                </Link>
                <Link href="/login?redirect=/partner" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium">
                    {t.nav.becomePartner}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
        <div className="absolute top-20 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            {t.hero.title1}
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-6 sm:mb-10 px-2"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link href="/login?redirect=/partner" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              >
                {t.hero.ctaStart}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#calculator" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl"
              >
                {t.hero.ctaCalculate}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-6 sm:gap-16 mt-10 sm:mt-16"
          >
            {[
              { value: "50%", label: t.hero.stats.commission },
              { value: t.hero.stats.lifetime, label: t.hero.stats.duration },
              { value: "$0", label: t.hero.stats.minPayout },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] sm:text-sm text-zinc-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {t.valueProps.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto px-2">
              {t.valueProps.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <ValueCard
              icon={Percent}
              title={t.valueProps.cards[0].title}
              description={t.valueProps.cards[0].description}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              delay={0}
            />
            <ValueCard
              icon={BarChart3}
              title={t.valueProps.cards[1].title}
              description={t.valueProps.cards[1].description}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              delay={0.1}
            />
            <ValueCard
              icon={Globe}
              title={t.valueProps.cards[2].title}
              description={t.valueProps.cards[2].description}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-12 sm:py-20 px-4 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-mono mb-3 sm:mb-4">
              <TrendingUp className="w-3 h-3" />
              {t.calculator.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {t.calculator.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 px-2">
              {t.calculator.subtitle}
            </p>
          </div>

          <EarningsCalculator t={t.calculator} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 px-2">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {t.howItWorks.steps.map((item, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-zinc-800 border border-zinc-700 mb-3 sm:mb-4">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                  </div>
                  <span className="absolute -top-1 left-1/2 ml-5 sm:ml-6 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm px-4 sm:px-0">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-12 sm:py-20 px-4 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                {t.features.title1}
              </h2>
              <ul className="space-y-3 sm:space-y-4">
                {t.features.list1.map((item, i) => (
                  <FeatureItem key={i}>{item}</FeatureItem>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
                {t.features.title2}
              </h2>
              <ul className="space-y-3 sm:space-y-4">
                {t.features.list2.map((item, i) => (
                  <FeatureItem key={i}>{item}</FeatureItem>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 rounded-2xl sm:rounded-3xl blur-3xl" />
            <div className="relative p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-zinc-900/80">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                {t.cta.title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
                {t.cta.subtitle}
              </p>
              <Link href="/login?redirect=/partner">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  {t.cta.button}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">
              {t.footer.copyright}
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="text-xs sm:text-sm text-zinc-500 hover:text-white transition-colors">
              {t.footer.home}
            </Link>
            <Link href="/login" className="text-xs sm:text-sm text-zinc-500 hover:text-white transition-colors">
              {t.footer.signIn}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
