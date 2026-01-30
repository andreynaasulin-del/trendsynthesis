"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

// Placeholder — will be replaced with real data from Supabase
const projects: Project[] = [];

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rendering: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
          <p className="mt-1 text-muted-foreground">
            All your video generation batches
          </p>
        </div>
        <Button asChild>
          <Link href="/generate">New Generation</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <FolderOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Generate your first batch of 30 viral videos.
            </p>
            <Button asChild className="mt-6 gap-2">
              <Link href="/generate">
                <Sparkles className="h-4 w-4" />
                Start Generating
              </Link>
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="p-5 transition-colors hover:bg-accent/50">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium leading-snug">{project.topic}</h3>
                  <Badge
                    variant="outline"
                    className={statusColors[project.status] || ""}
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{project.video_count} videos</span>
                  <span>{project.style}</span>
                  <span>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
