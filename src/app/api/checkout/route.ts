// ============================================
// TRENDSYNTHESIS — Stripe Checkout API
// Supports: Credit Packs (one-time) + Business AI Subscription
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getStripe, CREDIT_PACKS, BUSINESS_SUBSCRIPTION, type CreditPackId } from "@/lib/stripe/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const VALID_CREDIT_PACKS: CreditPackId[] = ["creator", "pro", "agency"];

// GET /api/checkout - Redirect to Stripe Checkout (for direct links)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const type = searchParams.get("type"); // "credits" or "subscription"
    const packId = searchParams.get("pack") as CreditPackId | null;

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

        const origin = request.headers.get("origin") || "https://trendsynthesis.vercel.app";

        // Customer Portal action
        if (action === "portal" && profile?.stripe_customer_id) {
            const portalSession = await getStripe().billingPortal.sessions.create({
                customer: profile.stripe_customer_id,
                return_url: `${origin}/billing`,
            });
            return NextResponse.redirect(portalSession.url);
        }

        // Get or create Stripe customer
        let customerId = profile?.stripe_customer_id;
        if (!customerId) {
            const customer = await getStripe().customers.create({
                email: user.email || profile?.email,
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;
            await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
        }

        // Business AI Subscription
        if (type === "subscription") {
            const session = await getStripe().checkout.sessions.create({
                customer: customerId,
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [{ price: BUSINESS_SUBSCRIPTION.stripePriceId, quantity: 1 }],
                success_url: `${origin}/billing?success=subscription`,
                cancel_url: `${origin}/billing?canceled=true`,
                subscription_data: {
                    metadata: {
                        supabase_user_id: user.id,
                        product_type: "business_ai"
                    },
                },
            });
            return NextResponse.redirect(session.url!);
        }

        // Credit Pack Purchase
        if (type === "credits" && packId && VALID_CREDIT_PACKS.includes(packId)) {
            const pack = CREDIT_PACKS[packId];
            const session = await getStripe().checkout.sessions.create({
                customer: customerId,
                mode: "payment", // One-time payment
                payment_method_types: ["card"],
                line_items: [{ price: pack.stripePriceId, quantity: 1 }],
                success_url: `${origin}/billing?success=credits&pack=${packId}`,
                cancel_url: `${origin}/billing?canceled=true`,
                metadata: {
                    supabase_user_id: user.id,
                    product_type: "credits",
                    pack_id: packId,
                    credits_amount: String(pack.credits),
                },
            });
            return NextResponse.redirect(session.url!);
        }

        return NextResponse.redirect(new URL("/billing?error=invalid_product", request.url));
    } catch (error: any) {
        console.error("[API] Checkout GET error:", error);
        return NextResponse.redirect(new URL("/billing?error=checkout_failed", request.url));
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
        const { type, packId } = body as {
            type: "credits" | "subscription";
            packId?: CreditPackId
        };

        // Validate input
        if (type === "credits" && (!packId || !VALID_CREDIT_PACKS.includes(packId))) {
            return NextResponse.json(
                { success: false, error: "Invalid credit pack" },
                { status: 400 }
            );
        }

        if (type !== "credits" && type !== "subscription") {
            return NextResponse.json(
                { success: false, error: "Invalid product type" },
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
                metadata: { supabase_user_id: user.id },
            });
            customerId = customer.id;
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        const origin = request.headers.get("origin") || "https://trendsynthesis.vercel.app";

        // Business AI Subscription
        if (type === "subscription") {
            const session = await getStripe().checkout.sessions.create({
                customer: customerId,
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [{ price: BUSINESS_SUBSCRIPTION.stripePriceId, quantity: 1 }],
                success_url: `${origin}/billing?success=subscription`,
                cancel_url: `${origin}/billing?canceled=true`,
                subscription_data: {
                    metadata: {
                        supabase_user_id: user.id,
                        product_type: "business_ai",
                    },
                },
            });

            return NextResponse.json({
                success: true,
                data: { sessionId: session.id, url: session.url },
            });
        }

        // Credit Pack Purchase
        const pack = CREDIT_PACKS[packId!];
        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [{ price: pack.stripePriceId, quantity: 1 }],
            success_url: `${origin}/billing?success=credits&pack=${packId}`,
            cancel_url: `${origin}/billing?canceled=true`,
            metadata: {
                supabase_user_id: user.id,
                product_type: "credits",
                pack_id: packId!,
                credits_amount: String(pack.credits),
            },
        });

        return NextResponse.json({
            success: true,
            data: { sessionId: session.id, url: session.url },
        });
    } catch (error: any) {
        console.error("[API] Checkout error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
