export const PRICING_CONFIG = {
    credits: {
        creator: {
            amount: 19,
            credits: 80,
            name: "Creator Pack",
            features: ["80 Credits", "1080p HD", "No Watermark"]
        },
        pro: {
            amount: 49,
            credits: 250,
            name: "Pro Pack",
            isPopular: true,
            features: ["250 Credits", "Priority Generation", "Commercial Rights", "+50% Bonus Credits"]
        },
        agency: {
            amount: 129,
            credits: 1000,
            name: "Agency God Mode",
            features: [
                "1000 Credits (Massive Scale)",
                "Business AI Included (Lifetime)",
                "Viral DNA Stealer (Beta)",
                "Dedicated Support"
            ]
        }
    },
    business: {
        amount: 19,
        name: "Business AI Subscription",
        duration_days: 30,
        trial_days: 7 // Bonus for first time
    }
} as const;
