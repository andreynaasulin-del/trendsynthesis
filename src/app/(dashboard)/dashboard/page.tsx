"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Video, TrendingUp, Coins, Crown, Zap, ArrowRight, Play, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getUserStats, getRecentActivity, type UserStats, type RecentActivity } from "@/actions/user-data";
import { cn } from "@/lib/utils";

// Elegant, subtle animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    }
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    }
  },
};

export default function DashboardPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, activity] = await Promise.all([
          getUserStats(),
          getRecentActivity()
        ]);
        setStats(userData);
        setRecentActivity(activity);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const content = {
    en: {
      welcome: (name: string) => `Hello, ${name}`,
      subtitle: "Here is what's happening today.",
      emptyTitle: "No projects yet",
      emptyDesc: "Start your first generation and create viral videos.",
      startBtn: "Start Generating",
      quickActions: "Quick Actions",
      newGen: "New Generation",
      viewProjects: "View Projects",
      recentActivity: "Recent Activity",
      loading: "Loading dashboard...",
      credits: "Credits",
      totalVideos: "Total Videos",
      plan: "Current Plan",
      monthly: "This Month",
      upgrade: "Upgrade",
      viewAll: "View All"
    },
    ru: {
      welcome: (name: string) => `Привет, ${name}`,
      subtitle: "Вот что происходит сегодня.",
      emptyTitle: "Нет проектов",
      emptyDesc: "Начните генерацию и создайте вирусные видео.",
      startBtn: "Начать",
      quickActions: "Быстрые действия",
      newGen: "Новая генерация",
      viewProjects: "Мои проекты",
      recentActivity: "Недавняя активность",
      loading: "Загрузка...",
      credits: "Кредиты",
      totalVideos: "Всего видео",
      plan: "Текущий план",
      monthly: "За месяц",
      upgrade: "Улучшить",
      viewAll: "Все"
    },
  };

  const c = content[language];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600/20 blur-xl rounded-full" />
            <Loader2 className="h-8 w-8 animate-spin text-violet-400 relative z-10" />
          </div>
          <p className="text-xs text-zinc-500 tracking-wide font-mono uppercase">{c.loading}</p>
        </motion.div>
      </div>
    );
  }

  // Helper to determine display text for Plan
  const getPlanDisplay = (plan: string | undefined) => {
    if (plan === "agency") return "GOD MODE";
    if (!plan) return "Free";
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const isGodMode = stats?.plan === "agency";

  const statsData = [
    {
      title: c.credits,
      value: stats?.credits.toString() || "0",
      icon: Coins,
      warning: (stats?.credits || 0) <= 0,
      color: "text-white font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
    },
    {
      title: c.plan,
      value: getPlanDisplay(stats?.plan),
      icon: Crown,
      color: isGodMode ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 font-extrabold" : "text-violet-300 font-bold"
    },
    {
      title: c.totalVideos,
      value: stats?.totalVideos.toString() || "0",
      icon: Video,
      color: "text-zinc-200"
    },
    {
      title: c.monthly,
      value: stats?.monthlyVideos.toString() || "0",
      icon: TrendingUp,
      color: "text-zinc-200"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl px-1 sm:px-0 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          {c.welcome(stats?.firstName || "Creator")}
          {isGodMode && <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono tracking-widest uppercase">VIP</span>}
        </h1>
        <p className="text-sm text-white/40">{c.subtitle}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4"
      >
        {statsData.map((stat, i) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="group relative border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md transition-all duration-300 overflow-hidden">
              {/* Hover spotlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <CardContent className="p-5 sm:p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", stat.warning && "bg-amber-500/10")}>
                    <stat.icon className={cn("h-4 w-4", stat.warning ? "text-amber-500" : "text-zinc-400 group-hover:text-zinc-200")} />
                  </div>
                  {stat.title === c.plan && stats?.plan === "free" && (
                    <Link href="/billing" className="text-[9px] font-bold text-violet-300 hover:text-white bg-violet-600/20 px-2 py-1 rounded border border-violet-500/30 transition-colors uppercase tracking-wide">
                      {c.upgrade}
                    </Link>
                  )}
                </div>
                <div className="space-y-1">
                  <p className={cn("text-3xl sm:text-4xl tracking-tight leading-none", stat.color)}>{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Column: Quick Actions & Chart/Usage (Placeholder) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase">{c.recentActivity}</h2>
              <Link href="/projects" className="text-xs text-violet-400 hover:text-violet-300 transition-all hover:translate-x-1 flex items-center gap-1">
                {c.viewAll} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid gap-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                  <Link href={`/projects`} key={activity.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-white/5 backdrop-blur-sm transition-all cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-white/10 transition-colors">
                        {activity.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> :
                          activity.status === 'failed' ? <XCircle className="w-5 h-5 text-red-500" /> :
                            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">{activity.topic}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-zinc-600 font-mono">{new Date(activity.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                            {activity.video_count} videos
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-zinc-500 bg-white/5 backdrop-blur-sm">
                  <p className="text-sm">{c.emptyDesc}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase px-1">{c.quickActions}</h2>

            <Link href="/generate">
              <button className="w-full group relative overflow-hidden p-0.5 rounded-2xl transition-transform active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4 p-5 rounded-[14px] bg-slate-950/90 group-hover:bg-slate-950/80 transition-colors backdrop-blur-xl">
                  <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-base tracking-tight">{c.newGen}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">AI → 30 Viral Videos</p>
                  </div>
                </div>
              </button>
            </Link>

            <Link href="/projects">
              <button className="w-full text-left flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-white/5 hover:border-white/10 transition-all active:scale-[0.98] backdrop-blur-md">
                <div className="p-3 rounded-xl bg-white/5 text-zinc-300">
                  <Play className="w-6 h-6" fill="currentColor" />
                </div>
                <div>
                  <p className="font-bold text-white text-base tracking-tight">{c.viewProjects}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{stats?.totalVideos || 0} videos created</p>
                </div>
              </button>
            </Link>

            {stats?.plan === 'free' && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 mt-4 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-2 mb-2 relative z-10">
                  <Crown className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="font-bold text-amber-400 text-sm tracking-wide">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4 relative z-10">Unlock unlimited generations and premium AI models.</p>
                <Link href="/billing" className="relative z-10">
                  <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold border-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
}
