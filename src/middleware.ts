// ============================================
// TRENDSYNTHESIS — Middleware V2
// Rate Limiting + Session Management
// ============================================

import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { isRateLimitConfigured, getRateLimiterForPath } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- SKIP AUTH CALLBACK (let it handle its own cookies) ---
  if (pathname === "/auth/callback" || pathname === "/callback") {
    return NextResponse.next();
  }

  // --- RATE LIMITING (API routes only) ---
  if (pathname.startsWith("/api/") && isRateLimitConfigured()) {
    try {
      // Get client IP (works with Vercel, Cloudflare, etc.)
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        "127.0.0.1";

      // Select appropriate rate limiter based on route
      const limiter = getRateLimiterForPath(pathname);
      const { success, limit, reset, remaining } = await limiter.limit(ip);

      // Add rate limit headers to response
      const headers = new Headers();
      headers.set("X-RateLimit-Limit", limit.toString());
      headers.set("X-RateLimit-Remaining", remaining.toString());
      headers.set("X-RateLimit-Reset", reset.toString());

      if (!success) {
        // 429 Too Many Requests
        return new NextResponse(
          JSON.stringify({
            error: "Too many requests",
            message: "Rate limit exceeded. Please slow down.",
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
              ...Object.fromEntries(headers),
            },
          }
        );
      }

      // Continue with rate limit headers
      const response = await updateSession(request);
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    } catch (error) {
      // If rate limiting fails, let request through (fail open)
      // This prevents outages if Upstash is down
      console.warn("[Middleware] Rate limit check failed:", error);
      return await updateSession(request);
    }
  }

  // --- NON-API routes: just handle session ---
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
