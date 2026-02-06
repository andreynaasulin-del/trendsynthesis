


import { openai } from "./client";
import type { Scenario } from "@/types";

interface GenerateScenariosParams {
  topic: string;
  videoCount?: number;
  language?: string;
  creatorSettings?: {
    systemPrompt?: string;
    targetAudience?: string;
    videoExamples?: string[];
    trafficSource?: string;
    niche?: string;
    goal?: string;
  };
}

export async function generateScenarios({
  topic,
  videoCount = 3,
  language = "ru",
  creatorSettings,
}: GenerateScenariosParams): Promise<Scenario[]> {
  const isRussian = language === "ru";
  const BATCH_SIZE = 5; // Split into chunks of 5 to avoid timeouts

  // --- Prepare Batches ---
  const batches: number[] = [];
  let remaining = videoCount;
  while (remaining > 0) {
    batches.push(Math.min(remaining, BATCH_SIZE));
    remaining -= BATCH_SIZE;
  }

  console.log(`🚀 Generative AI: Starting ${videoCount} scenarios in ${batches.length} batches.`);

  // --- Common Context Construction ---
  const contextBlock = `
  CONTEXT:
  - Niche: ${creatorSettings?.niche || "General Business"}
  - Goal: ${creatorSettings?.goal || "Viral Reach"}
  - Audience: ${creatorSettings?.targetAudience || "Broad"}
  `;

  // Variation styles for diversity
  const VARIATION_STYLES = [
    { name: "aggressive", desc: "Fast cuts, high contrast, shock value" },
    { name: "storytelling", desc: "Narrative arc, emotional connection" },
    { name: "educational", desc: "Step-by-step, value-driven, tutorial" },
    { name: "controversial", desc: "Provocative, contrarian, hate-click" },
    { name: "luxury", desc: "Premium aesthetic, minimalist, status" },
    { name: "meme", desc: "Humor, relatable, meme format" },
  ];
  const systemPrompt = `ROLE: You are an elite Viral Architect for Short-Form Video (TikTok/Reels).
${contextBlock}

OBJ: Generate viral scripts based on the user's topic/prompt.

🛑 CRITICAL RULES:
1. LANGUAGE ADAPTATION:
   - DETECT the language of the User's Topic.
   - GENERATE the script (Hook, Body, CTA) in the SAME language.
   - If topic is English -> English script.
   - If topic is Russian -> Russian script.
   - Do NOT mix languages.

2. VISUAL DIRECTOR (ASSETS):
   - 'asset_queries' MUST be English DETAILED VISUAL DESCRIPTIONS for stock footage (Pexels).
   - DO NOT USE SINGLE KEYWORDS like "money" or "office".
   - PAINT A PICTURE: Describe the scene, lighting, and mood.
   - FORMAT: "Scene description + atmosphere + camera angle".
   - BAD: "money", "business", "office", "typing".
   - GOOD: "stacks of 100 dollar bills lighting up in dark room, cinematic lighting", "futuristic neon city rain night, cyberpunk atmosphere, drone shot", "man in suit looking at city skyline from skyscraper window, success mood".
   - DIVERSITY RULE: Each scenario must use RADICALLY DIFFERENT visual themes.

3. STRUCTURE:
   - Hook: Visual or Audio grabber (0-3s).
   - Body: High value/gratification (max 20 words).
   - CTA: Clear instruction.`;

  // --- Process Batches in Parallel ---
  const validScenarios: Scenario[] = [];

  // --- ЗАПРОС ПОЛЬЗОВАТЕЛЯ ---
  const promises = batches.map(async (countInBatch, batchIdx) => {
    const userPrompt = `Generate ${countInBatch} UNIQUE scenarios for topic: "${topic}".
    
    OUTPUT JSON (Strict):
    {
      "scenarios": [
        {
          "title": "Short Title",
          "hook": "Overlay Text (On Screen, < 8 words)",
          "body": "Spoken Script (Voiceover)",
          "cta": "Call to Action",
          "angle": "Unique angle (Fear/Desire/Curiosity)",
          "voiceover_text": "Full spoken text (max 30s)",
          "asset_queries": [
            "Distinct Visual 1 (English, Cinematic, 4k)",
            "Distinct Visual 2 (English, Different scene)",
            "Distinct Visual 3 (English, Closing shot)"
          ]
        }
      ]
    }`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast & Cost Effective
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response");

      const parsed = JSON.parse(content);
      const rawScenarios = parsed.scenarios || parsed;

      // Normalize scenarios from this batch
      const toneMap: Record<string, "provocative" | "educational" | "casual" | "professional" | "emotional"> = {
        aggressive: "provocative",
        storytelling: "emotional",
        educational: "educational",
        controversial: "provocative",
        luxury: "professional",
        meme: "casual",
      };

      const normalized = Array.isArray(rawScenarios) ? rawScenarios.map((s: any, idx: number) => ({
        id: `scenario-${Date.now()}-${batchIdx}-${idx}`,
        project_id: "",
        index: validScenarios.length + idx,
        title: s.title || "Untitled",
        hook: s.hook || "",
        body: s.body || "",
        cta: s.cta || "",
        asset_queries: (s.asset_queries || [s.hook]).map((q: string) =>
          q.includes("cinematic") ? q : `${q}, cinematic, 4k, dark mode`
        ),
        voiceover_text: s.voiceover_text || "",
        duration_seconds: 15,
        keywords: [],
        angle: s.angle || VARIATION_STYLES[batchIdx % VARIATION_STYLES.length]?.name || "Viral",
        tone: toneMap[s.angle?.toLowerCase()] || "provocative" as const,
        created_at: new Date().toISOString(),
      })) : [];

      return normalized;
    } catch (err) {
      console.error(`Batch ${batchIdx} failed:`, err);
      return []; // Return empty on failure to not break Promise.all
    }
  });

  const results = await Promise.all(promises);
  results.forEach(batchScenarios => validScenarios.push(...batchScenarios));

  if (validScenarios.length === 0) {
    throw new Error("Failed to generate any scenarios from AI.");
  }

  // Assign correct indices after collecting all
  return validScenarios.map((s, i) => ({ ...s, index: i }));
}
