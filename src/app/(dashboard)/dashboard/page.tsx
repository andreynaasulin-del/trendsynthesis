"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Video, TrendingUp, Coins, Crown, Zap, ArrowRight, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { fetchProfile, fetchProjects } from "@/lib/api-client";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

  // Fetch real data on mount with MVP fallback
  useEffect(() => {
    async function fetchData() {
      // MVP: Set default stats immediately, update if API succeeds
      const defaultStats: DashboardStats = {
        totalVideos: 0,
        monthlyVideos: 0,
        creditsLeft: 3,
        plan: "free",
        projectCount: 0,
      };

      // Set loading to false quickly with defaults
      const timeout = setTimeout(() => {
        if (loading) {
          console.log("🔓 MVP: Using default dashboard data");
          setStats(defaultStats);
          setLoading(false);
        }
      }, 1500); // 1.5 second max wait

      try {
        const [profileRes, projectsRes] = await Promise.all([
          fetchProfile(),
          fetchProjects(),
        ]);

        clearTimeout(timeout);

        const profile = profileRes.data;
        const projects = projectsRes.data || [];

        // Calculate stats
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        // Count videos across all projects
        let totalVideos = 0;
        let monthlyVideos = 0;
        projects.forEach((p: { video_count?: number; created_at: string }) => {
          totalVideos += p.video_count || 0;
          const d = new Date(p.created_at);
          if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
            monthlyVideos += p.video_count || 0;
          }
        });

        setStats({
          totalVideos,
          monthlyVideos,
          creditsLeft: profile?.credits_remaining ?? 3,
          plan: profile?.plan || "free",
          projectCount: projects.length,
        });
      } catch (err) {
        clearTimeout(timeout);
        console.log("🔓 MVP: API failed, using defaults");
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
      subtitle: "Overview of your content generation activity",
      emptyTitle: "No projects yet",
      emptyDesc: "Start your first generation and create viral videos from a single topic.",
      startBtn: "Start Generating",
      quickActions: "Quick Actions",
      newGen: "New Generation",
      viewProjects: "View Projects",
      loading: "Loading...",
    },
    ru: {
      title: "Дашборд",
      subtitle: "Обзор активности генерации контента",
      emptyTitle: "Нет проектов",
      emptyDesc: "Начните первую генерацию и создайте вирусные видео из одной темы.",
      startBtn: "Начать генерацию",
      quickActions: "Быстрые действия",
      newGen: "Новая генерация",
      viewProjects: "Мои проекты",
      loading: "Загрузка...",
    },
  };

  const c = content[language];

  // Dynamic stats based on real data
  const statsData = [
    {
      title: language === "ru" ? "Всего видео" : "Total Videos",
      value: stats?.totalVideos.toString() || "0",
      icon: Video,
      desc: language === "ru" ? "Создано за всё время" : "Generated all time"
    },
    {
      title: language === "ru" ? "За месяц" : "This Month",
      value: stats?.monthlyVideos.toString() || "0",
      icon: TrendingUp,
      desc: language === "ru" ? "Видео за этот месяц" : "Videos this month"
    },
    {
      title: language === "ru" ? "Кредиты" : "Credits Left",
      value: stats?.creditsLeft.toString() || "0",
      icon: Coins,
      desc: language === "ru" ? "Осталось генераций" : "Generations remaining",
      highlight: (stats?.creditsLeft || 0) <= 0,
    },
    {
      title: language === "ru" ? "План" : "Plan",
      value: stats?.plan === "free" ? (language === "ru" ? "Free" : "Free") : stats?.plan?.toUpperCase() || "Free",
      icon: Crown,
      desc: language === "ru" ? "Текущий план" : "Current plan"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground font-mono">{c.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">{c.subtitle}</p>
      </div>

      {/* Credits Warning */}
      {stats && stats.creditsLeft <= 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <p className="text-sm text-amber-300 font-medium">
            {language === "ru"
              ? "⚠️ У вас закончились кредиты. Обновите план для продолжения генерации."
              : "⚠️ You're out of credits. Upgrade your plan to continue generating."}
          </p>
          <Button asChild size="sm" className="mt-2 bg-amber-600 hover:bg-amber-500">
            <Link href="/#pricing">
              {language === "ru" ? "Обновить план" : "Upgrade Plan"}
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Stats Grid - Mobile optimized */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 grid-cols-2 lg:grid-cols-4"
      >
        {statsData.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className={`relative overflow-hidden border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors ${stat.highlight ? 'border-amber-500/30' : ''}`}>
              <div className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-1.5 md:p-2 rounded-lg bg-zinc-800">
                  <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.highlight ? 'text-amber-400' : 'text-violet-400'}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-xl md:text-3xl font-bold">{stat.value}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions - Mobile optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{c.quickActions}</h2>
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
          <Link href="/generate">
            <Card className="group cursor-pointer border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all active:scale-[0.98]">
              <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-6">
                <div className="p-2 md:p-3 rounded-xl bg-violet-600/20 group-hover:bg-violet-600/30 transition-colors">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base">{c.newGen}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">AI → Viral Videos</p>
                </div>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/projects">
            <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all active:scale-[0.98]">
              <CardContent className="flex items-center gap-3 md:gap-4 p-4 md:p-6">
                <div className="p-2 md:p-3 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                  <Play className="h-5 w-5 md:h-6 md:w-6 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base">{c.viewProjects}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {stats?.projectCount || 0} {language === "ru" ? "проектов" : "projects"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Empty state - only if no projects */}
      {stats && stats.projectCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="flex flex-col items-center justify-center p-8 md:p-12 text-center border-dashed border-zinc-800 bg-zinc-950/50">
            <div className="mb-4 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20">
              <Video className="h-6 w-6 md:h-7 md:w-7 text-violet-400" />
            </div>
            <h3 className="text-base md:text-lg font-semibold">{c.emptyTitle}</h3>
            <p className="mt-1 max-w-sm text-xs md:text-sm text-muted-foreground">{c.emptyDesc}</p>
            <Button asChild className="mt-4 md:mt-6 bg-violet-600 hover:bg-violet-500 gap-2">
              <Link href="/generate">
                <Zap className="h-4 w-4" />
                {c.startBtn}
              </Link>
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
