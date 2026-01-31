// ============================================
// TRENDSYNTHESIS — API Client Helpers
// ============================================

import type { Project, Scenario, Video, User, ApiResponse } from "@/types";

const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || `HTTP ${response.status}`,
            };
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Network error",
        };
    }
}

// ============================================
// PROFILE
// ============================================

export async function fetchProfile(): Promise<ApiResponse<User & { stats: any }>> {
    return apiFetch<User & { stats: any }>("/profile");
}

export async function updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiFetch<User>("/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

// ============================================
// PROJECTS
// ============================================

export async function fetchProjects(): Promise<ApiResponse<Project[]>> {
    return apiFetch<Project[]>("/projects");
}

export async function fetchProject(id: string): Promise<ApiResponse<Project & { scenarios: Scenario[]; videos: Video[] }>> {
    return apiFetch<Project & { scenarios: Scenario[]; videos: Video[] }>(`/projects/${id}`);
}

export async function createNewProject(data: {
    topic: string;
    video_count?: number;
    style?: string;
    language?: string;
}): Promise<ApiResponse<Project>> {
    return apiFetch<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteProjectById(id: string): Promise<ApiResponse<void>> {
    return apiFetch<void>(`/projects?id=${id}`, {
        method: "DELETE",
    });
}

export async function updateProjectStatus(
    id: string,
    status: string
): Promise<ApiResponse<void>> {
    return apiFetch<void>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

// ============================================
// GENERATION
// ============================================

export async function saveGeneration(data: {
    topic: string;
    language: string;
    style: string;
    scenarios: any[];
    compositions: any[];
}): Promise<ApiResponse<{
    project: Project;
    scenarios: Scenario[];
    videos: Video[];
    creditsRemaining: number;
}>> {
    return apiFetch("/save-generation", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ============================================
// RENDERING
// ============================================

export async function startRender(data: {
    video_id: string;
    project_id: string;
    composition_data: any;
}): Promise<ApiResponse<{ video_id: string; status: string }>> {
    return apiFetch("/render", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getRenderStatus(videoId: string): Promise<ApiResponse<{
    id: string;
    status: string;
    progress: number;
    file_url: string | null;
    completed_at: string | null;
}>> {
    return apiFetch(`/render?video_id=${videoId}`);
}

// ============================================
// EXPORT / DOWNLOAD
// ============================================

export async function exportVideo(videoId: string): Promise<Blob | null> {
    try {
        const response = await fetch(`${API_BASE}/export?video_id=${videoId}`);
        if (!response.ok) return null;
        return await response.blob();
    } catch {
        return null;
    }
}

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
