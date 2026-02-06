


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
    { name: "aggressive", desc: "Быстрая смена кадров, контрастные цвета, шок" },
    { name: "storytelling", desc: "Нарративная структура, эмоциональная дуга" },
    { name: "educational", desc: "Пошаговое объяснение, польза, туториал" },
    { name: "controversial", desc: "Провокация, против общего мнения, хейт-клик" },
    { name: "luxury", desc: "Премиум эстетика, минимализм, статус" },
    { name: "meme", desc: "Юмор, мемный формат, относительность" },
  ];

  const systemPrompt = isRussian
    ? `ROLE: Ты — элитный Viral Architect для TikTok/Reels.
${contextBlock}

🛑 CRITICAL RULES (MANDATORY):
1. LANGUAGE (ЯЗЫК):
   - ВЕСЬ ТЕКСТ (Voiceover, Hook, Body, CTA) должен быть СТРОГО НА РУССКОМ.
   - ЗАПРЕЩЕНО использовать английский в сценарии.
   - Если ты напишешь "Why..." вместо "Почему...", генерация будет отклонена.

2. VISUAL DIRECTOR (ASSETS):
   - Поле 'asset_queries' — это запросы для поиска видео (Pexels). Они должны быть на АНГЛИЙСКОМ.
   - ЗАПРЕЩЕНО: Односложные запросы ("Money", "Office"). Это дает мусорные видео.
   - ОБЯЗАТЕЛЬНО: Минимум 3 прилагательных + описание света/стиля.
   - ФОРМАТ: "noun + action + lighting/style".
   - ПРИМЕР: "stressed businessman pulling hair dark cinematic lighting 4k".

3. STRUCTURE:
   - Hook: Кликбейт (0-3 сек).
   - Body: Сжатая польза (макс 20 слов).
   - CTA: Призыв подписаться.

4. 🎨 DIVERSITY (КРИТИЧНО!):
   - КАЖДЫЙ сценарий должен иметь УНИКАЛЬНЫЙ стиль и угол!
   - НЕ ПОВТОРЯЙ одинаковые хуки и тексты на экране.
   - Варьируй: тон, структуру, длину предложений, CTA.
   - Используй РАЗНЫЕ эмоциональные триггеры: страх, любопытство, жадность, гордость, FOMO.`
    : `ROLE: You are an elite Viral Architect.
${contextBlock}
RULES:
- Generate high-retention scripts in English.
- Use detailed visual descriptions for 'asset_queries' (min 3 adjectives).
- CRITICAL: Each scenario must have a UNIQUE style and angle. Do NOT repeat hooks or overlays.`;

  // --- Process Batches in Parallel ---
  const validScenarios: Scenario[] = [];

  const promises = batches.map(async (countInBatch, batchIdx) => {
    // Assign different styles to each batch for variety
    const batchStyles = VARIATION_STYLES.slice(batchIdx % VARIATION_STYLES.length, batchIdx % VARIATION_STYLES.length + 2);
    const styleHint = batchStyles.map(s => `${s.name}: ${s.desc}`).join(", ");

    const userPrompt = isRussian
      ? `Сгенерируй ${countInBatch} УНИКАЛЬНЫХ сценариев на тему: "${topic}".

🎯 ОБЯЗАТЕЛЬНО: Каждый сценарий должен быть РАЗНЫМ!
- Разные хуки (не повторяй слова!)
- Разные углы подачи
- Разные эмоциональные триггеры
- Рекомендуемые стили для этого батча: ${styleHint}

ВЫВОД JSON (Strict Structure):
{
  "scenarios": [
    {
      "title": "Заголовок (РУ) — УНИКАЛЬНЫЙ",
      "hook": "Текст на экране (РУ) — КОРОТКИЙ, КЛИКБЕЙТ, макс 8 слов",
      "body": "Текст сценария (РУ)",
      "cta": "Призыв (РУ) — УНИКАЛЬНЫЙ для каждого",
      "angle": "aggressive/storytelling/educational/controversial/luxury/meme",
      "voiceover_text": "Полный текст озвучки (РУ, только кириллица, макс 30 сек)",
      "asset_queries": [
        "DETAILED SCENE 1 DESCRIPTION IN ENGLISH (Cinematic, 4k, mood lighting)",
        "DETAILED SCENE 2 DESCRIPTION IN ENGLISH (Different scene, action)",
        "DETAILED SCENE 3 DESCRIPTION IN ENGLISH (Closing shot, emotional)"
      ]
    }
  ]
}`
      : `Generate ${countInBatch} UNIQUE scripts for topic "${topic}". Each must have different hooks, angles, and tones. Suggested styles: ${styleHint}. Output JSON format.`;

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
