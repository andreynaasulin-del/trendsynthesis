// ============================================
// TRENDSYNTHESIS — Supabase Middleware Helper
// MVP MODE: Auth bypass enabled
// ============================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // MVP MODE: Allow all requests through without auth check
  // This is temporary for demo purposes
  console.log("🔓 MVP MODE: Allowing access to", request.nextUrl.pathname);

  // Just refresh cookies if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
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

    // Just refresh the session, don't block anyone
    await supabase.auth.getUser();

    return supabaseResponse;
  } catch (error) {
    console.error("⚠️ Middleware Error:", error);
    return NextResponse.next({ request });
  }
}
