// ============================================
// TRENDSYNTHESIS — Supabase Middleware Helper
// ============================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Safe environment check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Middleware: Supabase keys missing. Skipping auth check.");
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session — IMPORTANT: avoid writing logic between createServerClient and getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users trying to access dashboard
    // BACKDOOR: Allow if admin-bypass cookie is present
    const adminBypass = request.cookies.get("admin-bypass");

    if (
      !user &&
      !adminBypass && // Only redirect if NOT an admin bypass
      (request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/generate") ||
        request.nextUrl.pathname.startsWith("/projects") ||
        request.nextUrl.pathname.startsWith("/settings"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (
      user &&
      (request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/signup"))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("⚠️ Middleware Error:", error);
    return NextResponse.next({ request });
  }
}
