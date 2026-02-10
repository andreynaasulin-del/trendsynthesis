// ============================================
// TRENDSYNTHESIS — Auth Callback Route
// Handles OAuth Code Exchange with proper cookie persistence for Vercel
// Path: /auth/callback (matches Supabase redirect URL)
// ============================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/generate";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Get origin dynamically to handle localhost vs Vercel
  const origin = request.nextUrl.origin;

  // Handle OAuth errors
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription);
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set("error", error);
    if (errorDescription) {
      errorUrl.searchParams.set("error_description", errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    console.error("[Auth Callback] No code provided");
    return NextResponse.redirect(new URL("/login?error=no_code", origin));
  }

  // Get cookie store (Next.js 15 async)
  const cookieStore = await cookies();

  // Create response to set cookies on
  const response = NextResponse.redirect(new URL(next, origin));

  // Create Supabase client with proper cookie handling for Vercel
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on response for the redirect
            response.cookies.set(name, value, {
              ...options,
              // Critical for Vercel production
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              httpOnly: true,
              path: "/",
            });
          });
        },
      },
    }
  );

  try {
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[Auth Callback] Code exchange failed:", exchangeError.message);
      return NextResponse.redirect(
        new URL(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, origin)
      );
    }

    if (!data.session) {
      console.error("[Auth Callback] No session returned");
      return NextResponse.redirect(new URL("/login?error=no_session", origin));
    }

    console.log("[Auth Callback] Session established for:", data.user?.email);

    // Check if user profile exists, create if not
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      // Create profile for new user
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
        avatar_url: data.user.user_metadata?.avatar_url || null,
        plan: "free",
        credits_remaining: 3, // Free tier credits
        has_business_ai: false,
        created_at: new Date().toISOString(),
      });
      console.log("[Auth Callback] Created profile for new user:", data.user.email);
    }

    // Return the response with cookies set
    return response;

  } catch (err: any) {
    console.error("[Auth Callback] Unexpected error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=unexpected&message=${encodeURIComponent(err.message || "Unknown error")}`, origin)
    );
  }
}
