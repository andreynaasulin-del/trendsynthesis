"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Zap,
  Plus,
  Film,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { fetchProjects, deleteProjectById } from "@/lib/api-client";
import type { Project } from "@/types";
import EmptyState from "@/components/ui/empty-state";

// Minimal status styles
const statusColors: Record<string, string> = {
  completed: "bg-zinc-800 text-zinc-300 border-zinc-700",
  composing: "bg-zinc-800 text-zinc-300 border-zinc-700",
  generating_scenarios: "bg-zinc-800 text-zinc-300 border-zinc-700",
  fetching_assets: "bg-zinc-800 text-zinc-300 border-zinc-700",
  brainstorming: "bg-zinc-800 text-zinc-300 border-zinc-700",
  failed: "bg-zinc-900 text-zinc-500 border-zinc-800",
  idle: "bg-zinc-900 text-zinc-500 border-zinc-800",
};

const statusIcons: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  composing: Film,
  generating_scenarios: Zap,
  fetching_assets: Clock,
  brainstorming: Zap,
  failed: AlertCircle,
  idle: Clock,
};

const statusLabels: Record<string, Record<string, string>> = {
  en: {
    completed: "Completed",
    composing: "Composing",
    generating_scenarios: "Generating",
    fetching_assets: "Fetching Assets",
    brainstorming: "Brainstorming",
    failed: "Failed",
    idle: "Idle",
  },
  ru: {
    completed: "Завершено",
    composing: "Сборка",
    generating_scenarios: "Генерация",
    fetching_assets: "Поиск ассетов",
    brainstorming: "Брейншторм",
    failed: "Ошибка",
    idle: "Ожидание",
  },
};

export default function ProjectsPage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetchProjects();
        if (res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Delete project
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(language === "ru" ? "Удалить этот проект?" : "Delete this project?")) return;

    setDeleting(id);
    try {
      await deleteProjectById(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(null);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{c.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{c.subtitle}</p>
        </div>
        <Button asChild size="sm" className="bg-white text-black hover:bg-zinc-200">
          <Link href="/generate">
            <Plus className="h-3.5 w-3.5 mr-1" />
            {c.newGen}
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={c.emptyTitle}
          description={c.emptyDesc}
          actionLabel={c.startBtn}
          actionHref="/generate"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, idx) => {
            const StatusIcon = statusIcons[project.status] || Film;
            const statusLabel = statusLabels[language]?.[project.status] || project.status;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link href={`/projects/${project.id}`}>
                  <Card className="group p-5 transition-all duration-200 hover:bg-zinc-900/60 border-zinc-800/60 bg-zinc-900/30 cursor-pointer">

                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800/50">
                          <StatusIcon className="h-4 w-4 text-zinc-400" />
                        </div>
                        <h3 className="font-medium leading-snug line-clamp-1">{project.topic}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={statusColors[project.status] || ""}
                        >
                          {statusLabel}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400"
                          onClick={(e) => handleDelete(project.id, e)}
                          disabled={deleting === project.id}
                        >
                          {deleting === project.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
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
