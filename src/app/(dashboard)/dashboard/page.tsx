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
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-xs text-zinc-500 tracking-wide">{c.loading}</p>
        </motion.div>
      </div>
    );
  }

  const statsData = [
    {
      title: c.credits,
      value: stats?.credits.toString() || "0",
      icon: Coins,
      warning: (stats?.credits || 0) <= 0,
      color: "text-amber-400 font-bold"
    },
    {
      title: c.plan,
      value: stats?.plan ? stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1) : "Free",
      icon: Crown,
      color: stats?.plan === "pro" || stats?.plan === "agency" ? "text-violet-400" : "text-white"
    },
    {
      title: c.totalVideos,
      value: stats?.totalVideos.toString() || "0",
      icon: Video,
    },
    {
      title: c.monthly,
      value: stats?.monthlyVideos.toString() || "0",
      icon: TrendingUp,
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl px-1 sm:px-0 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {c.welcome(stats?.firstName || "Creator")}
        </h1>
        <p className="text-sm text-zinc-500">{c.subtitle}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {statsData.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="group relative border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur transition-all duration-300">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={cn("h-4 w-4", stat.warning ? "text-amber-500" : "text-zinc-500")} />
                  {stat.title === c.plan && stats?.plan === "free" && (
                    <Link href="/billing" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 transition-colors">
                      {c.upgrade}
                    </Link>
                  )}
                </div>
                <div className="space-y-1">
                  <p className={cn("text-2xl sm:text-3xl tracking-tight", stat.color || "text-white")}>{stat.value}</p>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.title}</p>
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-400 tracking-wide uppercase">{c.recentActivity}</h2>
              <Link href="/projects" className="text-xs text-zinc-500 hover:text-white transition-colors">
                {c.viewAll}
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
                      className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors">
                        {activity.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                          activity.status === 'failed' ? <XCircle className="w-5 h-5 text-red-500" /> :
                            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{activity.topic}</h3>
                        <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>{activity.video_count} videos</span>
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 bg-zinc-900/20">
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
            <h2 className="text-sm font-medium text-zinc-400 tracking-wide uppercase">{c.quickActions}</h2>

            <Link href="/generate">
              <button className="w-full group relative overflow-hidden p-0.5 rounded-2xl transition-transform active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4 p-5 rounded-[14px] bg-zinc-950 hover:bg-zinc-900 transition-colors">
                  <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                    <Zap className="w-6 h-6" fill="currentColor" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white text-base">{c.newGen}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">AI → 30 Viral Videos</p>
                  </div>
                </div>
              </button>
            </Link>

            <Link href="/projects">
              <button className="w-full text-left flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all active:scale-[0.98]">
                <div className="p-3 rounded-xl bg-zinc-800/80 text-white">
                  <Play className="w-6 h-6" fill="currentColor" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">{c.viewProjects}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{stats?.totalVideos || 0} videos created</p>
                </div>
              </button>
            </Link>

            {stats?.plan === 'free' && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-amber-500 text-sm">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">Unlock unlimited generations and premium AI models.</p>
                <Link href="/billing">
                  <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold border-0">
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
