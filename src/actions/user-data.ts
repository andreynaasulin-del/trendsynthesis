"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface UserStats {
    credits: number;
    plan: string;
    totalVideos: number;
    monthlyVideos: number;
    firstName: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: "succeeded" | "pending" | "failed";
    created_at: string;
    description: string;
}

export interface RecentActivity {
    id: string;
    topic: string;
    status: string;
    created_at: string;
    video_count: number;
}

export async function getUserStats(): Promise<UserStats> {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            credits: 0,
            plan: "free",
            totalVideos: 0,
            monthlyVideos: 0,
            firstName: "Guest"
        };
    }

    // Parallel fetch for performance
    const [profileRes, projectsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("projects").select("id, video_count, created_at").eq("user_id", user.id)
    ]);

    const profile = profileRes.data;
    const projects = projectsRes.data || [];

    // Calculate stats
    const totalVideos = projects.reduce((acc: number, p: any) => acc + (p.video_count || 0), 0);

    const now = new Date();
    const monthlyVideos = projects
        .filter((p: any) => {
            const d = new Date(p.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc: number, p: any) => acc + (p.video_count || 0), 0);

    return {
        credits: profile?.credits_remaining || 0,
        plan: profile?.plan || "free",
        totalVideos,
        monthlyVideos,
        firstName: profile?.full_name?.split(" ")[0] || "Creator"
    };
}

export async function getTransactions(): Promise<Transaction[]> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Try to fetch real transactions if table exists, otherwise return mock
    try {
        const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (!error && data) return data;
    } catch (e) {
        // Table likely doesn't exist
    }

    // Mock data for UI demonstration
    return [
        {
            id: "tx_1",
            amount: 29.00,
            currency: "USD",
            status: "succeeded",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            description: "Pro Plan Subscription"
        },
        {
            id: "tx_2",
            amount: 15.00,
            currency: "USD",
            status: "succeeded",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
            description: "100 Credits Top-up"
        }
    ];
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("projects")
        .select("id, topic, status, created_at, video_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

    return (data || []).map((p: any) => ({
        id: p.id,
        topic: p.topic,
        status: p.status,
        created_at: p.created_at,
        video_count: p.video_count
    }));
}
