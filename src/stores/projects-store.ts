// ============================================
// TRENDSYNTHESIS — Projects History Store
// Хранит историю всех генераций
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Scenario, VideoStyle } from "@/types";

interface ProjectSummary {
  id: string;
  topic: string;
  scenarioCount: number;
  style: VideoStyle;
  language: string;
  status: "completed" | "failed";
  createdAt: string;
  completedAt: string | null;
}

interface ProjectsState {
  projects: ProjectSummary[];
  totalGenerated: number;

  // Actions
  addProject: (project: ProjectSummary) => void;
  removeProject: (id: string) => void;
  clearAll: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      totalGenerated: 0,

      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects].slice(0, 50), // Keep last 50
          totalGenerated: state.totalGenerated + 1,
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      clearAll: () => set({ projects: [], totalGenerated: 0 }),
    }),
    {
      name: "trendsynthesis-projects",
    }
  )
);
