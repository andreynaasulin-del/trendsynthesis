// ============================================
// TRENDSYNTHESIS — OpenAI Client
// ============================================

import OpenAI from "openai";

// Server-side only — never import on client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ Warning: OPENAI_API_KEY is missing. AI generation will fail.");
}
