"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Video, TrendingUp, Coins, Crown, Zap, ArrowRight, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { fetchProfile, fetchProjects } from "@/lib/api-client";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

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

interface DashboardStats {
  totalVideos: number;
  monthlyVideos: number;
  creditsLeft: number;
  plan: string;
  projectCount: number;
}

export default function DashboardPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const defaultStats: DashboardStats = {
        totalVideos: 0,
        monthlyVideos: 0,
        creditsLeft: 3,
        plan: "free",
        projectCount: 0,
      };

      const timeout = setTimeout(() => {
        if (loading) {
          setStats(defaultStats);
          setLoading(false);
        }
      }, 1500);

      try {
        const [profileRes, projectsRes] = await Promise.all([
          fetchProfile(),
          fetchProjects(),
        ]);

        clearTimeout(timeout);

        const profile = profileRes.data;
        const projects = projectsRes.data || [];

        setStats({
          totalVideos: projects.reduce((acc: number, p: any) => acc + (p.video_count || 0), 0),
          monthlyVideos: projects.filter((p: any) => {
            const created = new Date(p.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).reduce((acc: number, p: any) => acc + (p.video_count || 0), 0),
          creditsLeft: profile?.credits_remaining || 3,
          plan: profile?.plan || "free",
          projectCount: projects.length,
        });
      } catch (err) {
        clearTimeout(timeout);
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const content = {
    en: {
      title: "Dashboard",
      subtitle: "Overview of your content generation",
      emptyTitle: "No projects yet",
      emptyDesc: "Start your first generation and create viral videos.",
      startBtn: "Start Generating",
      quickActions: "Quick Actions",
      newGen: "New Generation",
      viewProjects: "View Projects",
      loading: "Loading...",
    },
    ru: {
      title: "Дашборд",
      subtitle: "Обзор генерации контента",
      emptyTitle: "Нет проектов",
      emptyDesc: "Начните генерацию и создайте вирусные видео.",
      startBtn: "Начать",
      quickActions: "Быстрые действия",
      newGen: "Новая генерация",
      viewProjects: "Мои проекты",
      loading: "Загрузка...",
    },
  };

  const c = content[language];

  const statsData = [
    {
      title: language === "ru" ? "Всего видео" : "Total Videos",
      value: stats?.totalVideos.toString() || "0",
      icon: Video,
    },
    {
      title: language === "ru" ? "За месяц" : "This Month",
      value: stats?.monthlyVideos.toString() || "0",
      icon: TrendingUp,
    },
    {
      title: language === "ru" ? "Кредиты" : "Credits",
      value: stats?.creditsLeft.toString() || "0",
      icon: Coins,
      warning: (stats?.creditsLeft || 0) <= 0,
    },
    {
      title: language === "ru" ? "План" : "Plan",
      value: stats?.plan ? stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1) : "Free",
      icon: Crown,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          <p className="text-xs text-zinc-500 tracking-wide">{c.loading}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header — Clean, minimal */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white">{c.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{c.subtitle}</p>
      </motion.div>

      {/* Credits Warning — Subtle */}
      {stats && stats.creditsLeft <= 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
        >
          <p className="text-sm text-zinc-400">
            {language === "ru" ? "Кредиты закончились" : "Out of credits"}
          </p>
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-zinc-800">
            <Link href="/#pricing">
              {language === "ru" ? "Обновить" : "Upgrade"}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Stats Grid — Minimal cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
      >
        {statsData.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="group relative border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/60 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`h-4 w-4 ${stat.warning ? 'text-amber-400' : 'text-zinc-500'}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500 tracking-wide">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions — Clean buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-4"
      >
        <h2 className="text-sm font-medium text-zinc-400 tracking-wide">{c.quickActions}</h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">

          {/* Primary Action */}
          <Link href="/generate">
            <Card className="group cursor-pointer border-zinc-700/50 bg-white/[0.02] hover:bg-white/[0.04] hover:border-zinc-600/50 transition-all duration-300 active:scale-[0.99]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="p-2.5 rounded-lg bg-zinc-800/80 group-hover:bg-zinc-800 transition-colors">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white">{c.newGen}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">AI → 30 Videos</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </Link>

          {/* Secondary Action */}
          <Link href="/projects">
            <Card className="group cursor-pointer border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700/60 transition-all duration-300 active:scale-[0.99]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="p-2.5 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-800/80 transition-colors">
                  <Play className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-zinc-300">{c.viewProjects}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {stats?.projectCount || 0} {language === "ru" ? "проектов" : "projects"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
              </CardContent>
            </Card>
          </Link>

        </div>
      </motion.div>

      {/* Empty State — Elegant, not flashy */}
      {stats && stats.projectCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-5 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <Video className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-base font-medium text-white">{c.emptyTitle}</h3>
            <p className="mt-1.5 text-sm text-zinc-500 max-w-xs">{c.emptyDesc}</p>
            <Button asChild size="sm" className="mt-6 bg-white text-black hover:bg-zinc-200 transition-colors">
              <Link href="/generate">
                {c.startBtn}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Onboarding Wizard */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
}
