// ============================================
// TRENDSYNTHESIS — Scenario Generation Engine
// ============================================

import { openai } from "./client";
import type { Scenario } from "@/types";

interface GenerateScenariosParams {
  topic: string;
  videoCount?: number;
  language?: string;
}

export async function generateScenarios({
  topic,
  videoCount = 30,
  language = "en",
}: GenerateScenariosParams): Promise<Scenario[]> {
  const systemPrompt = `You are a viral content strategist.
You create scenarios for HIGH-PACED short-form vertical videos (TikTok, Reels, Shorts).
Target duration: 15 SECONDS MAX.
Style: Fast, engaging, no fluff.
Output ONLY valid JSON.`;

  const userPrompt = `Generate ${videoCount} unique video scenarios for the topic: "${topic}"
Language: ${language} (STRICTLY OUTPUT ALL VISIBLE TEXT AND VOICEOVER IN THIS LANGUAGE)

For each scenario, provide:
- title: catchy video title
- hook: first 3 seconds attention grabber (short & punchy)
- body: main content (fast paced, max 2 sentences)
- cta: call to action (short)
- angle: the unique perspective/angle
- tone: one of "professional", "casual", "provocative", "educational", "emotional"
- keywords: array of 3-5 SEO keywords
- asset_queries: array of 2-3 search queries for stock video footage (ALWAYS IN ENGLISH for search accuracy)
- voiceover_text: full voiceover script combining hook + body + cta (MAX 40 WORDS)
- duration_seconds: estimated video duration (15)

Return JSON object with key "scenarios" containing array of ${videoCount} scenario objects.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.9,
    max_tokens: 16000,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content);
  const scenarios = Array.isArray(parsed) ? parsed : parsed.scenarios || [];

  return scenarios.map((s: Record<string, unknown>, index: number) => ({
    id: `scenario-${index}`,
    project_id: "",
    index,
    title: (s.title as string) || "",
    hook: (s.hook as string) || "",
    body: (s.body as string) || "",
    cta: (s.cta as string) || "",
    angle: (s.angle as string) || "",
    tone: (s.tone as string) || "casual",
    keywords: (s.keywords as string[]) || [],
    asset_queries: (s.asset_queries as string[]) || [],
    voiceover_text: (s.voiceover_text as string) || "",
    duration_seconds: (s.duration_seconds as number) || 30,
    created_at: new Date().toISOString(),
  }));
}
