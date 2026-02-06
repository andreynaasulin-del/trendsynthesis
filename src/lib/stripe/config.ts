// ============================================
// TRENDSYNTHESIS — Stripe Configuration
// New Economy: Credits (pay-as-you-go) + Business AI Subscription
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

// ============================================
// CREDIT PACKS (One-time purchases)
// ============================================
export const CREDIT_PACKS = {
    creator: {
        id: "creator",
        name: "Creator Pack",
        nameRu: "Креатор",
        price: 19,
        credits: 80,
        pricePerCredit: 0.24,
        bonus: 0,
        popular: false,
        stripePriceId: process.env.STRIPE_CREDITS_CREATOR_ID || "price_credits_creator_19",
    },
    pro: {
        id: "pro",
        name: "Pro Pack",
        nameRu: "Про",
        price: 49,
        credits: 250,
        pricePerCredit: 0.196,
        bonus: 50,
        popular: true,
        stripePriceId: process.env.STRIPE_CREDITS_PRO_ID || "price_credits_pro_49",
    },
    agency: {
        id: "agency",
        name: "Agency God Mode",
        nameRu: "Агентство",
        price: 129,
        credits: 1000,
        pricePerCredit: 0.129,
        bonus: 100,
        popular: false,
        stripePriceId: process.env.STRIPE_CREDITS_AGENCY_ID || "price_credits_agency_129",
    },
} as const;

export type CreditPackId = keyof typeof CREDIT_PACKS;

// ============================================
// BUSINESS AI SUBSCRIPTION (Monthly)
// ============================================
export const BUSINESS_SUBSCRIPTION = {
    id: "business_ai",
    name: "Business AI",
    nameRu: "Бизнес AI",
    price: 19,
    features: {
        en: [
            "Unlimited Business Assistant Chat",
            "Strategy & Monetization Advice",
            "Niche Analysis & Trends",
            "Growth Playbooks",
            "Priority AI Responses",
            "Export Strategies to PDF",
        ],
        ru: [
            "Безлимитный Бизнес-Ассистент",
            "Стратегии и монетизация",
            "Анализ ниши и трендов",
            "Плейбуки роста",
            "Приоритетные ответы AI",
            "Экспорт стратегий в PDF",
        ],
    },
    stripePriceId: process.env.STRIPE_BUSINESS_AI_PRICE_ID || "price_business_ai_monthly",
};

// ============================================
// FREE TIER
// ============================================
export const FREE_TIER = {
    credits: 3, // Free credits on signup
    features: {
        en: [
            "3 free generations",
            "720p resolution",
            "Basic styles",
            "Watermark included",
            "Creator Mode only",
        ],
        ru: [
            "3 бесплатные генерации",
            "720p разрешение",
            "Базовые стили",
            "С водяным знаком",
            "Только режим Креатор",
        ],
    },
};

// ============================================
// PARTNER COMMISSION RATES (50/50 everywhere)
// ============================================
export const PARTNER_COMMISSIONS = {
    credits: 0.50, // 50% from credit pack purchases
    subscription: 0.50, // 50% recurring from Business AI subscription
};

// ============================================
// GENERATION COSTS
// ============================================
export const GENERATION_COST = {
    creditsPerGeneration: 1, // 1 credit = 1 generation (up to 30 videos)
    maxVideosPerGeneration: 30,
};

// ============================================
// RESOLUTION BY CREDITS SPENT (Cumulative)
// ============================================
export const RESOLUTION_TIERS = {
    "720p": { minSpent: 0, label: "HD" },
    "1080p": { minSpent: 15, label: "Full HD" }, // After first Creator pack
    "4k": { minSpent: 99, label: "4K Ultra" }, // After Agency pack
};

// ============================================
// LEGACY SUPPORT (for migration)
// ============================================
export const PRICE_IDS = {
    creator_monthly: CREDIT_PACKS.creator.stripePriceId,
    agency_monthly: CREDIT_PACKS.agency.stripePriceId,
    business_ai: BUSINESS_SUBSCRIPTION.stripePriceId,
} as const;

export const PLAN_CREDITS: Record<string, number> = {
    free: FREE_TIER.credits,
    creator: CREDIT_PACKS.creator.credits,
    pro: CREDIT_PACKS.pro.credits,
    agency: CREDIT_PACKS.agency.credits,
};

export const PLAN_FEATURES: Record<string, string[]> = {
    free: FREE_TIER.features.en,
    business: BUSINESS_SUBSCRIPTION.features.en,
};

export type PlanType = "free" | "business";
export type ProductType = "credits" | "subscription";
