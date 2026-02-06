// ============================================
// TRENDSYNTHESIS — Stripe Webhooks
// Handles: Credit Pack Purchases + Business AI Subscription
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getStripe, CREDIT_PACKS, FREE_TIER, PARTNER_COMMISSIONS, type CreditPackId } from "@/lib/stripe/config";
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
    const productType = session.metadata?.product_type;

    if (!userId) {
        // Try to find from subscription metadata
        if (session.subscription) {
            const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);
            const subUserId = subscription.metadata?.supabase_user_id;
            if (subUserId) {
                return handleSubscriptionCheckout(session, subUserId);
            }
        }
        console.error("[Webhook] No user ID in session metadata");
        return;
    }

    console.log(`[Webhook] Checkout complete for user ${userId}, type: ${productType}`);

    // Handle Credit Pack Purchase (one-time payment)
    if (productType === "credits") {
        const packId = session.metadata?.pack_id as CreditPackId;
        const creditsAmount = parseInt(session.metadata?.credits_amount || "0", 10);

        if (!packId || !creditsAmount) {
            console.error("[Webhook] Missing credit pack info");
            return;
        }

        const pack = CREDIT_PACKS[packId];
        const amountPaid = (session.amount_total || 0) / 100; // cents to dollars

        // Add credits to user
        const supabase = getSupabaseAdmin();
        const { data: profile } = await supabase
            .from("profiles")
            .select("credits_remaining, total_spent")
            .eq("id", userId)
            .single();

        const currentCredits = profile?.credits_remaining || 0;
        const currentSpent = profile?.total_spent || 0;

        await supabase
            .from("profiles")
            .update({
                credits_remaining: currentCredits + pack.credits,
                total_spent: currentSpent + amountPaid,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        console.log(`[Webhook] Added ${pack.credits} credits to user ${userId}`);

        // Log the purchase
        await supabase.from("usage_logs").insert({
            user_id: userId,
            action: "credits_purchased",
            credits_used: -pack.credits, // negative = added
            metadata: {
                pack_id: packId,
                pack_name: pack.name,
                amount_paid: amountPaid,
                session_id: session.id,
            },
        });

        // Handle affiliate commission (50%)
        await handleAffiliateCommission(userId, amountPaid, "credits", supabase);
        return;
    }

    // Handle Business AI Subscription
    if (productType === "business_ai") {
        await handleSubscriptionCheckout(session, userId);
        return;
    }

    // Legacy: old subscription flow
    const plan = session.metadata?.plan;
    if (plan) {
        await getSupabaseAdmin()
            .from("profiles")
            .update({
                plan: "business",
                has_business_ai: true,
                stripe_subscription_id: session.subscription as string,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
    }
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session, userId: string) {
    const amountPaid = (session.amount_total || 0) / 100;
    const supabase = getSupabaseAdmin();

    // Update user with Business AI subscription
    const { error } = await supabase
        .from("profiles")
        .update({
            has_business_ai: true,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    if (error) {
        console.error("[Webhook] Failed to update profile:", error);
        throw error;
    }

    console.log(`[Webhook] Business AI subscription activated for user ${userId}`);

    // Log the event
    await supabase.from("usage_logs").insert({
        user_id: userId,
        action: "business_ai_subscribed",
        metadata: {
            amount_paid: amountPaid,
            session_id: session.id,
            subscription_id: session.subscription,
        },
    });

    // Handle affiliate commission (50%)
    await handleAffiliateCommission(userId, amountPaid, "subscription", supabase);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
        // Try to find user by subscription ID
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

    const supabase = getSupabaseAdmin();

    // Find user and remove Business AI access
    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

    if (profile) {
        await supabase
            .from("profiles")
            .update({
                has_business_ai: false,
                stripe_subscription_id: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

        await supabase.from("usage_logs").insert({
            user_id: profile.id,
            action: "business_ai_canceled",
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

    const supabase = getSupabaseAdmin();

    // Find user by subscription
    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

    if (profile) {
        const amountPaid = (invoice.amount_paid || 0) / 100;

        console.log(`[Webhook] Recurring payment of $${amountPaid} for user ${profile.id}`);

        await supabase.from("usage_logs").insert({
            user_id: profile.id,
            action: "subscription_renewed",
            metadata: { invoice_id: invoice.id, amount: amountPaid },
        });

        // Handle recurring affiliate commission (50%)
        await handleAffiliateCommission(profile.id, amountPaid, "subscription", supabase);
    }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
    console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = invoice as any;
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

// ============================================
// AFFILIATE COMMISSION HANDLER (50/50)
// ============================================

async function handleAffiliateCommission(
    userId: string,
    amountPaid: number,
    type: "credits" | "subscription",
    supabase: ReturnType<typeof getSupabaseAdmin>
) {
    // Check if user was referred
    const { data: referral } = await supabase
        .from("referrals")
        .select("affiliate_id, id")
        .eq("referred_user_id", userId)
        .single();

    if (!referral) return;

    // Calculate commission (50% for both types)
    const commissionRate = PARTNER_COMMISSIONS[type]; // 0.50
    const commission = amountPaid * commissionRate;

    // Update affiliate earnings
    const { data: affiliate } = await supabase
        .from("affiliates")
        .select("total_earnings, pending_payout")
        .eq("id", referral.affiliate_id)
        .single();

    if (affiliate) {
        await supabase
            .from("affiliates")
            .update({
                total_earnings: (affiliate.total_earnings || 0) + commission,
                pending_payout: (affiliate.pending_payout || 0) + commission,
                updated_at: new Date().toISOString(),
            })
            .eq("id", referral.affiliate_id);

        // Log commission
        await supabase.from("commission_logs").insert({
            affiliate_id: referral.affiliate_id,
            referral_id: referral.id,
            amount: commission,
            type: type,
            original_amount: amountPaid,
            commission_rate: commissionRate,
        });

        console.log(`[Webhook] Credited $${commission} commission to affiliate ${referral.affiliate_id}`);
    }
}
