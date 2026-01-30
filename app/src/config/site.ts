// ============================================
// TRENDSYNTHESIS — Site Configuration
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

  pricing: [
    {
      id: "free" as const,
      name: "Starter",
      price: 0,
      currency: "USD",
      interval: "month" as const,
      credits: 1,
      features: [
        "1 free generation (30 videos)",
        "720p resolution",
        "Basic styles",
        "Watermark",
      ],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: 49,
      currency: "USD",
      interval: "month" as const,
      credits: 20,
      features: [
        "20 generations / month (600 videos)",
        "1080p resolution",
        "All styles & tones",
        "No watermark",
        "Priority rendering",
        "Voiceover in 15 languages",
      ],
      highlighted: true,
    },
    {
      id: "agency" as const,
      name: "Agency",
      price: 199,
      currency: "USD",
      interval: "month" as const,
      credits: 100,
      features: [
        "100 generations / month (3000 videos)",
        "4K resolution",
        "All styles & tones",
        "No watermark",
        "Instant rendering",
        "API access",
        "White-label export",
        "Priority support",
      ],
    },
  ],

  limits: {
    free: { maxGenerations: 1, maxVideosPerGeneration: 30, resolution: "720p" },
    pro: { maxGenerations: 20, maxVideosPerGeneration: 30, resolution: "1080p" },
    agency: { maxGenerations: 100, maxVideosPerGeneration: 30, resolution: "4k" },
  },
} as const;
