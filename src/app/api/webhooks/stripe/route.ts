// ============================================
// TRENDSYNTHESIS — Stripe Webhooks
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLAN_CREDITS } from "@/lib/stripe/config";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role for webhook operations - lazy initialization
function getSupabaseAdmin() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Supabase environment variables not set");
    }
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing signature" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return NextResponse.json(
            { error: `Webhook signature verification failed: ${err.message}` },
            { status: 400 }
        );
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaid(invoice);
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoiceFailed(invoice);
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("[Webhook] Error processing event:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.supabase_user_id;
    const plan = session.metadata?.plan || "creator";

    if (!userId) {
        console.error("[Webhook] No user ID in session metadata");
        return;
    }

    console.log(`[Webhook] Checkout complete for user ${userId}, plan: ${plan}`);

    // Update user plan and credits
    const { error } = await getSupabaseAdmin()
        .from("profiles")
        .update({
            plan,
            credits_remaining: PLAN_CREDITS[plan] || 20,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    if (error) {
        console.error("[Webhook] Failed to update profile:", error);
        throw error;
    }

    // Log the event
    await getSupabaseAdmin().from("usage_logs").insert({
        user_id: userId,
        action: "subscription_started",
        metadata: { plan, session_id: session.id },
    });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
        // Try to find user by customer ID
        const { data: profile } = await getSupabaseAdmin()
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", subscription.id)
            .single();

        if (!profile) {
            console.error("[Webhook] Could not find user for subscription");
            return;
        }
    }

    const status = subscription.status;
    console.log(`[Webhook] Subscription ${subscription.id} status: ${status}`);

    // Handle active/inactive status
    if (status === "active" || status === "trialing") {
        // Subscription is active
    } else if (status === "past_due" || status === "unpaid") {
        // Subscription has issues
        console.log(`[Webhook] Subscription ${subscription.id} is ${status}`);
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log(`[Webhook] Subscription deleted: ${subscription.id}`);

    // Find user and downgrade to free
    const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

    if (profile) {
        await getSupabaseAdmin()
            .from("profiles")
            .update({
                plan: "free",
                credits_remaining: 1,
                stripe_subscription_id: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

        await getSupabaseAdmin().from("usage_logs").insert({
            user_id: profile.id,
            action: "subscription_canceled",
            metadata: { subscription_id: subscription.id },
        });
    }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = invoice as any;
    if (inv.billing_reason !== "subscription_cycle") return;

    // subscription can be string, Subscription object, or null
    const subscriptionId = typeof inv.subscription === 'string'
        ? inv.subscription
        : inv.subscription?.id;

    // Find user and refresh credits
    const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("id, plan")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

    if (profile) {
        const credits = PLAN_CREDITS[profile.plan] || 20;

        await getSupabaseAdmin()
            .from("profiles")
            .update({
                credits_remaining: credits,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

        console.log(`[Webhook] Refreshed ${credits} credits for user ${profile.id}`);

        await getSupabaseAdmin().from("usage_logs").insert({
            user_id: profile.id,
            action: "credits_refreshed",
            credits_used: -credits,
            metadata: { invoice_id: invoice.id },
        });
    }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
    console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = invoice as any;
    // Optionally notify user or take action
    const subscriptionId = typeof inv.subscription === 'string'
        ? inv.subscription
        : inv.subscription?.id;

    const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

    if (profile) {
        await getSupabaseAdmin().from("usage_logs").insert({
            user_id: profile.id,
            action: "payment_failed",
            metadata: { invoice_id: invoice.id },
        });
    }
}
