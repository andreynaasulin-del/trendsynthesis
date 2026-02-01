// ============================================
// TRENDSYNTHESIS — Stripe Checkout API
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICE_IDS } from "@/lib/stripe/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/checkout - Redirect to Stripe Checkout (for direct links)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan");
    const action = searchParams.get("action");

    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Get profile for Stripe customer ID
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email")
            .eq("id", user.id)
            .single();

        // Customer Portal action
        if (action === "portal" && profile?.stripe_customer_id) {
            const portalSession = await getStripe().billingPortal.sessions.create({
                customer: profile.stripe_customer_id,
                return_url: `${request.headers.get("origin") || "https://trendsynthesis.vercel.app"}/settings`,
            });
            return NextResponse.redirect(portalSession.url);
        }

        // Checkout flow
        if (!plan || !["pro", "agency"].includes(plan)) {
            return NextResponse.redirect(new URL("/settings?error=invalid_plan", request.url));
        }

        let customerId = profile?.stripe_customer_id;
        if (!customerId) {
            const customer = await getStripe().customers.create({
                email: user.email || profile?.email,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;
            await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
        }

        const priceId = plan === "pro" ? PRICE_IDS.creator_monthly : PRICE_IDS.agency_monthly;
        const origin = request.headers.get("origin") || "https://trendsynthesis.vercel.app";

        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${origin}/settings?success=true`,
            cancel_url: `${origin}/settings?canceled=true`,
            subscription_data: {
                metadata: { supabase_user_id: user.id, plan },
            },
        });

        return NextResponse.redirect(session.url!);
    } catch (error: any) {
        console.error("[API] Checkout GET error:", error);
        return NextResponse.redirect(new URL("/settings?error=checkout_failed", request.url));
    }
}

// POST /api/checkout - Create Stripe Checkout Session (JSON API)
export async function POST(request: NextRequest) {
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
        const { plan } = body;

        if (!plan || !["pro", "agency"].includes(plan)) {
            return NextResponse.json(
                { success: false, error: "Invalid plan" },
                { status: 400 }
            );
        }

        // Get or create Stripe customer
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, email")
            .eq("id", user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await getStripe().customers.create({
                email: user.email || profile?.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            });
            customerId = customer.id;

            // Save customer ID
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // Create checkout session
        const priceId = plan === "pro"
            ? PRICE_IDS.creator_monthly
            : PRICE_IDS.agency_monthly;

        const origin = request.headers.get("origin") || "https://trendsynthesis.vercel.app";

        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/settings?success=true`,
            cancel_url: `${origin}/settings?canceled=true`,
            subscription_data: {
                metadata: {
                    supabase_user_id: user.id,
                    plan,
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url,
            },
        });
    } catch (error: any) {
        console.error("[API] Checkout error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
