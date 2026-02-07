// ============================================
// TRENDSYNTHESIS — Middleware V2
// TEST MODE: All routes open, no auth required
// TODO: Re-enable protection before production launch
// ============================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// TEST MODE flag — set to false to re-enable auth protection
const TEST_MODE = false;

// Routes that require authentication (disabled in TEST_MODE)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/partner",
  "/generate",
  "/settings",
  "/api/generate"
];

// Routes that redirect to dashboard if already logged in
const AUTH_ROUTES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ========================================
  // PRODUCTION MODE (Real Supabase Auth)
  // ========================================
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Middleware: Missing Supabase Env Vars");
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get("redirect");
    const destination = redirectTo || "/generate";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}
