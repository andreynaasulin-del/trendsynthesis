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

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
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

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { full_name, avatar_url } = body;

        const updated = await updateProfile({ full_name, avatar_url });

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
