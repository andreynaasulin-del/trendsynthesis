// ============================================
// TRENDSYNTHESIS — Environment Variables
// ============================================

// Validated environment variable access
// Throws at build time if required vars are missing

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getPublicEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing public environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Supabase
  supabase: {
    url: getPublicEnv("NEXT_PUBLIC_SUPABASE_URL", ""),
    anonKey: getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
    serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
  },

  // OpenAI
  openai: {
    apiKey: getEnv("OPENAI_API_KEY", ""),
  },

  // Pexels
  pexels: {
    apiKey: getEnv("PEXELS_API_KEY", ""),
  },

  // App
  app: {
    url: getPublicEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  },
} as const;
