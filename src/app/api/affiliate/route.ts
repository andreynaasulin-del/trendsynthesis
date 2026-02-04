// ============================================
// TRENDSYNTHESIS — Affiliate API
// GET: Get or create affiliate record for current user
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Generate a unique referral code from email/name
function generateReferralCode(email: string, name?: string): string {
  // Extract base from name or email
  const base = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);

  // Add random suffix
  const suffix = Math.random().toString(36).substring(2, 5);

  return `${base}_${suffix}`;
}

// GET: Get affiliate data for current user (auto-creates if not exists)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if affiliate record exists
    let { data: affiliate, error: fetchError } = await supabase
      .from("affiliates")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If no record exists, create one
    if (!affiliate) {
      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const referralCode = generateReferralCode(
        user.email || "user",
        profile?.full_name
      );

      const { data: newAffiliate, error: insertError } = await supabase
        .from("affiliates")
        .insert({
          user_id: user.id,
          referral_code: referralCode,
          total_clicks: 0,
          total_signups: 0,
          total_earnings: 0,
          pending_payout: 0,
          commission_rate: 50, // 50%
          status: "active",
        })
        .select()
        .single();

      if (insertError) {
        // If unique constraint error, try with different code
        if (insertError.code === "23505") {
          const newCode = generateReferralCode(user.email || "user") + Math.random().toString(36).substring(2, 3);

          const { data: retryAffiliate, error: retryError } = await supabase
            .from("affiliates")
            .insert({
              user_id: user.id,
              referral_code: newCode,
              total_clicks: 0,
              total_signups: 0,
              total_earnings: 0,
              pending_payout: 0,
              commission_rate: 50,
              status: "active",
            })
            .select()
            .single();

          if (retryError) {
            console.error("[Affiliate API] Insert retry error:", retryError);
            return NextResponse.json(
              { success: false, error: "Failed to create affiliate record" },
              { status: 500 }
            );
          }

          affiliate = retryAffiliate;
        } else {
          console.error("[Affiliate API] Insert error:", insertError);
          return NextResponse.json(
            { success: false, error: "Failed to create affiliate record" },
            { status: 500 }
          );
        }
      } else {
        affiliate = newAffiliate;
      }
    }

    // Get referral stats
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("id, status, created_at, commission_amount")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        affiliate,
        referrals: referrals || [],
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://trendsynthesis.vercel.app"}?ref=${affiliate.referral_code}`,
      },
    });
  } catch (error: any) {
    console.error("[Affiliate API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
