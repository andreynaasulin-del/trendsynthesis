// ============================================
// TRENDSYNTHESIS — Pexels Client
// ============================================

import { createClient } from "pexels";

// Server-side only — never import on client
export function getPexelsClient() {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not set");
  }
  return createClient(apiKey);
}
