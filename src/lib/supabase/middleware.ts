// ============================================
// TRENDSYNTHESIS — Middleware (MVP: NO AUTH)
// ============================================

import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // MVP MODE: No auth checks at all - let everyone through
  return NextResponse.next({ request });
}
