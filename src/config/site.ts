// ============================================
// TRENDSYNTHESIS — Site Configuration
// New Economy: Credits + Business AI Subscription
// ============================================

export const siteConfig = {
  name: "TRENDSYNTHESIS",
  tagline: "One topic — 30 viral videos",
  description:
    "AI-powered viral video factory. Upload a topic, get 30 unique videos in 5 minutes. No editors, no bans, pure content machine.",
  url: "https://trendsynthesis.com",
  ogImage: "/og.png",
  creator: "TRENDSYNTHESIS",

  nav: {
    marketing: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Demo", href: "#demo" },
    ],
    dashboard: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Generate", href: "/generate" },
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },

  // ============================================
  // CREDIT PACKS (One-time purchases)
  // ============================================
  creditPacks: [
    {
      id: "starter" as const,
      name: "Starter",
      nameRu: "Старт",
      price: 5,
      credits: 10,
      pricePerCredit: 0.50,
      bonus: 0,
      features: {
        en: ["10 generations (300 videos)", "720p resolution", "Basic styles"],
        ru: ["10 генераций (300 видео)", "720p разрешение", "Базовые стили"],
      },
    },
    {
      id: "creator" as const,
      name: "Creator",
      nameRu: "Креатор",
      price: 15,
      credits: 50,
      pricePerCredit: 0.30,
      bonus: 20,
      highlighted: true,
      features: {
        en: ["50 generations (1500 videos)", "1080p HD resolution", "All styles", "+20% bonus credits"],
        ru: ["50 генераций (1500 видео)", "1080p HD разрешение", "Все стили", "+20% бонус кредитов"],
      },
    },
    {
      id: "pro" as const,
      name: "Pro Pack",
      nameRu: "Про",
      price: 39,
      credits: 200,
      pricePerCredit: 0.195,
      bonus: 50,
      features: {
        en: ["200 generations (6000 videos)", "1080p HD resolution", "All styles", "No watermark", "+50% bonus credits"],
        ru: ["200 генераций (6000 видео)", "1080p HD разрешение", "Все стили", "Без водяного знака", "+50% бонус кредитов"],
      },
    },
    {
      id: "agency" as const,
      name: "Agency",
      nameRu: "Агентство",
      price: 99,
      credits: 600,
      pricePerCredit: 0.165,
      bonus: 80,
      features: {
        en: ["600 generations (18000 videos)", "4K resolution", "All styles", "No watermark", "Priority rendering", "+80% bonus credits"],
        ru: ["600 генераций (18000 видео)", "4K разрешение", "Все стили", "Без водяного знака", "Приоритетный рендер", "+80% бонус кредитов"],
      },
    },
  ],

  // ============================================
  // BUSINESS AI SUBSCRIPTION
  // ============================================
  businessSubscription: {
    id: "business_ai" as const,
    name: "Business AI",
    nameRu: "Бизнес AI",
    price: 19,
    interval: "month" as const,
    features: {
      en: [
        "Unlimited Business Assistant",
        "Strategy & Monetization",
        "Niche Analysis & Trends",
        "Growth Playbooks",
        "Priority AI Responses",
        "Export to PDF",
      ],
      ru: [
        "Безлимитный Бизнес-Ассистент",
        "Стратегии и монетизация",
        "Анализ ниши и трендов",
        "Плейбуки роста",
        "Приоритетные ответы AI",
        "Экспорт в PDF",
      ],
    },
  },

  // ============================================
  // FREE TIER
  // ============================================
  freeTier: {
    credits: 3,
    features: {
      en: ["3 free generations", "720p resolution", "Basic styles", "Creator Mode only"],
      ru: ["3 бесплатные генерации", "720p разрешение", "Базовые стили", "Только режим Креатор"],
    },
  },

  // ============================================
  // PARTNER PROGRAM (50/50 everywhere)
  // ============================================
  partnerProgram: {
    creditsCommission: 0.50, // 50%
    subscriptionCommission: 0.50, // 50%
    cookieDuration: 30, // days
    minPayout: 0,
    payoutMethods: ["USDT", "Bank Card"],
  },

  // ============================================
  // GENERATION SETTINGS
  // ============================================
  generation: {
    creditsPerGeneration: 1,
    maxVideosPerGeneration: 30,
  },

  // Legacy pricing (for backward compatibility)
  pricing: [
    {
      id: "free" as const,
      name: "Free",
      price: 0,
      currency: "USD",
      interval: "month" as const,
      credits: 3,
      features: ["3 free generations", "720p resolution", "Basic styles"],
    },
  ],

  limits: {
    free: { maxGenerations: 3, maxVideosPerGeneration: 30, resolution: "720p" },
  },
} as const;

export type CreditPackId = "starter" | "creator" | "pro" | "agency";
