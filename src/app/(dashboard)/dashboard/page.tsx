"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Video, TrendingUp, Coins, Crown, Sparkles, Zap, ArrowRight, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Dashboard",
      subtitle: "Overview of your content generation activity",
      stats: [
        { title: "Total Videos", value: "0", icon: Video, desc: "Generated all time" },
        { title: "This Month", value: "0", icon: TrendingUp, desc: "Videos this month" },
        { title: "Credits Left", value: "1", icon: Coins, desc: "Generations remaining" },
        { title: "Plan", value: "Free", icon: Crown, desc: "Current plan" },
      ],
      emptyTitle: "No projects yet",
      emptyDesc: "Start your first generation and create 30 viral videos from a single topic.",
      startBtn: "Start Generating",
      quickActions: "Quick Actions",
      newGen: "New Generation",
      viewProjects: "View Projects",
    },
    ru: {
      title: "Дашборд",
      subtitle: "Обзор активности генерации контента",
      stats: [
        { title: "Всего видео", value: "0", icon: Video, desc: "Создано за всё время" },
        { title: "За месяц", value: "0", icon: TrendingUp, desc: "Видео за этот месяц" },
        { title: "Кредиты", value: "1", icon: Coins, desc: "Осталось генераций" },
        { title: "План", value: "Free", icon: Crown, desc: "Текущий план" },
      ],
      emptyTitle: "Нет проектов",
      emptyDesc: "Начните первую генерацию и создайте 30 вирусных видео из одной темы.",
      startBtn: "Начать генерацию",
      quickActions: "Быстрые действия",
      newGen: "Новая генерация",
      viewProjects: "Мои проекты",
    },
  };

  const c = content[language];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-muted-foreground">{c.subtitle}</p>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {c.stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-zinc-800">
                  <stat.icon className="h-4 w-4 text-violet-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">{c.quickActions}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/generate">
            <Card className="group cursor-pointer border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/40 transition-all">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-violet-600/20 group-hover:bg-violet-600/30 transition-colors">
                  <Zap className="h-6 w-6 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.newGen}</h3>
                  <p className="text-sm text-muted-foreground">AI → 30 Videos</p>
                </div>
                <ArrowRight className="h-5 w-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/projects">
            <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                  <Play className="h-6 w-6 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.viewProjects}</h3>
                  <p className="text-sm text-muted-foreground">0 {language === "ru" ? "проектов" : "projects"}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </motion.div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-zinc-800 bg-zinc-950/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20">
            <Sparkles className="h-7 w-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold">{c.emptyTitle}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{c.emptyDesc}</p>
          <Button asChild className="mt-6 bg-violet-600 hover:bg-violet-500 gap-2">
            <Link href="/generate">
              <Zap className="h-4 w-4" />
              {c.startBtn}
            </Link>
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
