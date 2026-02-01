// ============================================
// TRENDSYNTHESIS — Database Service Layer
// ============================================

import { createServerSupabaseClient } from "./server";
import type { User, Project, Scenario, Video, VideoStyle, ProjectStatus } from "@/types";

// ============================================
// PROFILE OPERATIONS
// ============================================

export async function getProfile(): Promise<User | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        plan: data.plan as "free" | "pro" | "agency",
        credits_remaining: data.credits_remaining,

        // Creator Settings
        system_prompt: data.system_prompt,
        target_audience: data.target_audience,
        video_examples: data.video_examples,
        traffic_source: data.traffic_source,

        created_at: data.created_at,
        updated_at: data.updated_at,
    };
}

export async function updateProfile(updates: Partial<User>): Promise<User | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .update({
            full_name: updates.full_name,
            avatar_url: updates.avatar_url,
            system_prompt: updates.system_prompt,
            target_audience: updates.target_audience,
            video_examples: updates.video_examples,
            traffic_source: updates.traffic_source,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as User;
}

export async function decrementCredits(): Promise<number> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .rpc("decrement_credits", { user_id: user.id });

    if (error) throw new Error(error.message);
    return data;
}

// ============================================
// PROJECT OPERATIONS
// ============================================

export async function getProjects(): Promise<Project[]> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("projects")
        .select("*, scenarios(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Project[];
}

export async function getProject(projectId: string): Promise<Project | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("projects")
        .select("*, scenarios(*), videos(*)")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

    if (error) return null;
    return data as Project;
}

export interface CreateProjectInput {
    topic: string;
    video_count?: number;
    style?: VideoStyle;
    language?: string;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("projects")
        .insert({
            user_id: user.id,
            topic: input.topic,
            video_count: input.video_count || 6,
            style: input.style || "cinematic",
            language: input.language || "en",
            status: "pending",
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Project;
}

export async function updateProjectStatus(
    projectId: string,
    status: ProjectStatus
): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const updates: Record<string, unknown> = { status };
    if (status === "completed") {
        updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId);

    if (error) throw new Error(error.message);
}

export async function deleteProject(projectId: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
}

// ============================================
// SCENARIO OPERATIONS
// ============================================

export async function saveScenarios(
    projectId: string,
    scenarios: Omit<Scenario, "id" | "project_id" | "created_at">[]
): Promise<Scenario[]> {
    const supabase = await createServerSupabaseClient();

    const scenariosToInsert = scenarios.map((s, index) => ({
        project_id: projectId,
        index,
        title: s.title,
        hook: s.hook,
        body: s.body,
        cta: s.cta,
        angle: s.angle,
        tone: s.tone,
        keywords: s.keywords,
        asset_queries: s.asset_queries,
        voiceover_text: s.voiceover_text,
        duration_seconds: s.duration_seconds,
    }));

    const { data, error } = await supabase
        .from("scenarios")
        .insert(scenariosToInsert)
        .select();

    if (error) throw new Error(error.message);
    return data as Scenario[];
}

export async function getScenarios(projectId: string): Promise<Scenario[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", projectId)
        .order("index", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as Scenario[];
}

// ============================================
// VIDEO OPERATIONS
// ============================================

export async function createVideo(input: {
    project_id: string;
    scenario_id: string;
    style?: string;
    duration_seconds?: number;
}): Promise<Video> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("videos")
        .insert({
            project_id: input.project_id,
            scenario_id: input.scenario_id,
            style: input.style || "cinematic",
            duration_seconds: input.duration_seconds || 15,
            status: "queued",
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Video;
}

export async function updateVideoStatus(
    videoId: string,
    status: string,
    progress?: number,
    fileUrl?: string
): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const updates: Record<string, unknown> = { status };
    if (progress !== undefined) updates.render_progress = progress;
    if (fileUrl) updates.file_url = fileUrl;
    if (status === "completed") updates.completed_at = new Date().toISOString();

    const { error } = await supabase
        .from("videos")
        .update(updates)
        .eq("id", videoId);

    if (error) throw new Error(error.message);
}

export async function getVideos(projectId: string): Promise<Video[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as Video[];
}

// ============================================
// STATS / ANALYTICS
// ============================================

export async function getUserStats(): Promise<{
    totalVideos: number;
    thisMonth: number;
    creditsRemaining: number;
    plan: string;
}> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { totalVideos: 0, thisMonth: 0, creditsRemaining: 0, plan: "free" };
    }

    // Get profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("credits_remaining, plan")
        .eq("id", user.id)
        .single();

    // Get total videos count
    const { count: totalVideos } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("project_id", user.id);

    // Get this month's videos
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

    return {
        totalVideos: totalVideos || 0,
        thisMonth: thisMonth || 0,
        creditsRemaining: profile?.credits_remaining || 0,
        plan: profile?.plan || "free",
    };
}
