// ============================================
// TRENDSYNTHESIS — Rate Limiting (Upstash)
// Protects API routes from bot abuse
// ============================================

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (uses REST API — works on Edge & Serverless)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// --- Rate Limit Configurations ---

/**
 * CHAT API: 20 requests per minute per IP
 * Protects OpenAI spend from abuse
 */
export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:chat",
});

/**
 * GENERATION API: 10 requests per minute per IP
 * Heavy GPT-4o usage — stricter limit
 */
export const generateRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:generate",
});

/**
 * INGEST API: 30 requests per minute per IP
 * Pexels API has its own limits, this is extra protection
 */
export const ingestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "ratelimit:ingest",
});

/**
 * RENDER/EXPORT API: 5 requests per minute per IP
 * Very heavy operation — strict limit
 */
export const renderRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:render",
});

/**
 * GLOBAL FALLBACK: 100 requests per minute per IP
 * For any route not specifically configured
 */
export const globalRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:global",
});

// --- Helper to check if Upstash is configured ---
export function isRateLimitConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// --- Route → Limiter Mapping ---
export function getRateLimiterForPath(pathname: string): Ratelimit {
  if (pathname.startsWith("/api/chat")) return chatRatelimit;
  if (pathname.startsWith("/api/generate")) return generateRatelimit;
  if (pathname.startsWith("/api/ingest")) return ingestRatelimit;
  if (pathname.startsWith("/api/render") || pathname.startsWith("/api/export")) return renderRatelimit;
  return globalRatelimit;
}
