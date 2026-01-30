// ============================================
// TRENDSYNTHESIS — Next.js Proxy (formerly Middleware)
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (err) {
    console.error("CRITICAL: Proxy/Middleware Crash:", err);
    // Return a dummy response to prevent Vercel 404 (Edge Function Crash)
    // We let the page load; user might just be unauthenticated.
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
