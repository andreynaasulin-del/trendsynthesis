// ============================================
// TRENDSYNTHESIS — Next.js Middleware (Safe Vercel V2)
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
    try {
        // 1. Attempt to refresh user session
        return await updateSession(request);
    } catch (err) {
        console.error("⚠️ Middleware Safe Fallback:", err);
        // 2. If session refresh fails (e.g. Supabase keys missing),
        //    allow the request to proceed instead of blocking it.
        //    The page itself will handle unauthenticated states.
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
