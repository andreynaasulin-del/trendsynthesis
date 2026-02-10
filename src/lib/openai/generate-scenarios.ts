


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
  // Detect language hint (optional, but good for context)
  const isCyrillic = /[а-яА-ЯёЁ]/.test(topic);
  console.log(`🌐 Topic analysis: "${topic}" (Cyrillic: ${isCyrillic}, User Lang: ${language})`);

  // --- Process Batches in Parallel ---
  const validScenarios: Scenario[] = [];

  const promises = batches.map(async (countInBatch, batchIdx) => {

    // Improved System Prompt for GPT-4o
    const systemPrompt = `ROLE: You are an elite Viral Architect for Short-Form Video (TikTok/Reels).
${contextBlock}

OBJ: Generate ${countInBatch} VIRAL SCRIPTS for the topic: "${topic}".

🛑 LANGUAGE RULE (CRITICAL) 🛑
- DETECT the language of the topic "${topic}".
- GENERATE ALL TEXT (title, hook, body, cta, voiceover) IN THAT SAME LANGUAGE.
- Example: Topic "Как заработать" -> Output RUSSIAN.
- Example: Topic "How to make money" -> Output ENGLISH.
- IGNORE the "language" param from user if it conflicts with the topic language.
- EXCEPTION: 'asset_queries' MUST be in ENGLISH (for stock footage search).

📝 STRUCTURE (Viral Arc):
1. **Hook (0-2s)**: Shocking statement, question, or "Stop scrolling!" moment. Max 7 words.
2. **Body (2-10s)**: High-speed value delivery. No fluff. Max 20 words.
3. **CTA (10-15s)**: Direct command. Max 5 words.

🎬 VISUAL DIRECTOR (Asset Queries):
- Describe the scene VISUALLY (lighting, action, camera angle).
- KEYWORDS: Cinematic, 4k, hyper-realistic.
- NO abstract concepts. Concrete imagery only.
- Example: "Close up of money counting machine, dark room, neon green light, cinematic 4k"`;

    const userPrompt = `Generate ${countInBatch} UNIQUE scenarios.
    
OUTPUT JSON (Strict):
{
  "scenarios": [
    {
      "title": "Short Attention-Grabbing Title (in Topic Language)",
      "hook": "Aggressive Hook (in Topic Language)",
      "body": "Value Proposition (in Topic Language)",
      "cta": "Call to Action (in Topic Language)",
      "angle": "Psychological Angle (e.g., Fear, Greed, Curiosity)",
      "voiceover_text": "Full spoken script for TTS (in Topic Language, max 30s)",
      "asset_queries": [
        "Visual Description 1 (ENGLISH, Cinematic)",
        "Visual Description 2 (ENGLISH, High Action)",
        "Visual Description 3 (ENGLISH, Closing Shot)"
      ]
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Upgraded from gpt-4o-mini for better reasoning
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8, // Slightly higher for creativity
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
        fear: "provocative",
        greed: "provocative",
        curiosity: "educational",
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
          q.includes("cinematic") ? q : `${q}, cinematic, 4k, high quality`
        ),
        voiceover_text: s.voiceover_text || "",
        duration_seconds: 15, // Fixed duration for now, manageable
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
