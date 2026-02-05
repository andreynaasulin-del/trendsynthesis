// ============================================
// TRENDSYNTHESIS — User Profile API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfile, getUserStats } from "@/lib/supabase/db";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/profile - Get current user profile
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        // TEST MODE: Return default profile for unauthenticated users
        if (!user) {
            return NextResponse.json({
                success: true,
                data: {
                    id: "test-user",
                    full_name: "Test User",
                    email: "test@trendsynthesis.app",
                    niche: "content",
                    goal: "growth",
                    system_prompt: null,
                    target_audience: null,
                    video_examples: null,
                    traffic_source: null,
                    stats: { videos_generated: 0, projects_count: 0 },
                },
            });
        }

        const profile = await getProfile();
        const stats = await getUserStats();

        if (!profile) {
            return NextResponse.json(
                { success: false, error: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...profile,
                stats,
            },
        });
    } catch (error: any) {
        console.error("[API] Profile GET error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        // TEST MODE: Allow profile update without auth (return success)
        if (!user) {
            const body = await request.json();
            return NextResponse.json({
                success: true,
                data: { ...body, id: "test-user" },
            });
        }

        const body = await request.json();
        const {
            full_name,
            display_name,
            avatar_url,
            system_prompt,
            target_audience,
            video_examples,
            traffic_source
        } = body;

        // Support both full_name and display_name (display_name takes priority)
        const updated = await updateProfile({
            full_name: display_name || full_name,
            avatar_url,
            system_prompt,
            target_audience,
            video_examples,
            traffic_source,
        });

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error: any) {
        console.error("[API] Profile PATCH error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update profile" },
            { status: 500 }
        );
    }
}
