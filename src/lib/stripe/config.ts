// ============================================
// TRENDSYNTHESIS — Stripe Configuration
// ============================================

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2026-01-28.clover",
            typescript: true,
        });
    }
    return stripeInstance;
}

// Legacy export for compatibility
export const stripe = {
    get instance() {
        return getStripe();
    }
};

// Price IDs from Stripe Dashboard
export const PRICE_IDS = {
    creator_monthly: process.env.STRIPE_CREATOR_PRICE_ID || "price_creator_monthly",
    agency_monthly: process.env.STRIPE_AGENCY_PRICE_ID || "price_agency_monthly",
} as const;

// Plan to credits mapping
export const PLAN_CREDITS: Record<string, number> = {
    free: 1,
    creator: 20,
    agency: 9999,
};

// Plan features
export const PLAN_FEATURES: Record<string, string[]> = {
    free: [
        "3 Projects per month",
        "720p Render quality",
        "Standard Templates",
        "Watermarked Output",
    ],
    creator: [
        "20 Projects per month",
        "1080p HD Render",
        "Premium Strategies",
        "No Watermark",
        "Priority Processing",
        "Analytics Dashboard",
    ],
    agency: [
        "Unlimited Projects",
        "4K Ultra HD Render",
        "API Access",
        "White Label Export",
        "Dedicated Manager",
        "Custom Integrations",
    ],
};

export type PlanType = "free" | "creator" | "agency";
