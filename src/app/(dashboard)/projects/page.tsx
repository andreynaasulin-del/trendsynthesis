"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen, Sparkles, Zap, Plus, Film, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Project } from "@/types";

// Placeholder — will be replaced with real data from Supabase
const projects: Project[] = [];

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rendering: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const statusIcons: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  rendering: Film,
  pending: Clock,
};

export default function ProjectsPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Your Projects",
      subtitle: "All your video generation batches",
      newGen: "New Generation",
      emptyTitle: "No projects yet",
      emptyDesc: "Generate your first batch of 30 viral videos.",
      startBtn: "Start Generating",
      videos: "videos",
      created: "Created",
    },
    ru: {
      title: "Ваши проекты",
      subtitle: "Все ваши пакеты генерации видео",
      newGen: "Новая генерация",
      emptyTitle: "Нет проектов",
      emptyDesc: "Сгенерируйте первый пакет из 30 вирусных видео.",
      startBtn: "Начать генерацию",
      videos: "видео",
      created: "Создано",
    },
  };

  const c = content[language];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{c.title}</h1>
          <p className="mt-1 text-muted-foreground">{c.subtitle}</p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-500 gap-2">
          <Link href="/generate">
            <Plus className="h-4 w-4" />
            {c.newGen}
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-zinc-800 bg-zinc-950/50">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20">
              <FolderOpen className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold">{c.emptyTitle}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{c.emptyDesc}</p>
            <Button asChild className="mt-6 gap-2 bg-violet-600 hover:bg-violet-500">
              <Link href="/generate">
                <Zap className="h-4 w-4" />
                {c.startBtn}
              </Link>
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, idx) => {
            const StatusIcon = statusIcons[project.status] || Film;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="group p-5 transition-all hover:bg-zinc-900/80 hover:border-zinc-700 border-zinc-800 bg-zinc-900/50 cursor-pointer relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800">
                          <StatusIcon className="h-4 w-4 text-violet-400" />
                        </div>
                        <h3 className="font-medium leading-snug line-clamp-1">{project.topic}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[project.status] || ""}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Film className="h-3 w-3" />
                        {project.video_count} {c.videos}
                      </span>
                      <span className="capitalize">{project.style}</span>
                      <span>
                        {c.created}: {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
