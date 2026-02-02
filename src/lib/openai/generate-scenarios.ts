// ============================================
// TRENDSYNTHESIS — Scenario Generation Engine
// ============================================

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
  };
}

export async function generateScenarios({
  topic,
  videoCount = 30,
  language = "en",
  creatorSettings,
}: GenerateScenariosParams): Promise<Scenario[]> {
  const isRussian = language === "ru";

  // Build context from settings
  const audienceContext = creatorSettings?.targetAudience
    ? (isRussian ? `\nЦЕЛЕВАЯ АУДИТОРИЯ: ${creatorSettings.targetAudience}` : `\nTARGET AUDIENCE: ${creatorSettings.targetAudience}`)
    : "";

  const trafficContext = creatorSettings?.trafficSource
    ? (isRussian ? `\nПЛАТФОРМА И ТРАФИК: Оптимизируй для ${creatorSettings.trafficSource}` : `\nPLATFORM & TRAFFIC: Optimize for ${creatorSettings.trafficSource}`)
    : "";

  const examplesContext = creatorSettings?.videoExamples?.length
    ? (isRussian ? `\nРЕФЕРЕНСЫ (СТИЛЬ): ${creatorSettings.videoExamples.join(", ")}` : `\nVIDEO EXAMPLES (STYLE): ${creatorSettings.videoExamples.join(", ")}`)
    : "";

  const customSystemPrompt = creatorSettings?.systemPrompt || "";

  // SYSTEM PROMPT: Enforce Language and Style
  const systemPrompt = isRussian
    ? `Ты — элитный вирусный сценарист и визуальный директор.
Твоя задача — создавать сценарии для вертикальных видео (TikTok/Reels), которые удерживают внимание с 1-й секунды.
Глобальная инструкция: "${customSystemPrompt || "Создавай взрывной контент"}"

ВАЖНЕЙШИЕ ПРАВИЛА:
1. ЯЗЫК: Весь текст, озвучка и заголовки — СТРОГО НА РУССКОМ ЯЗЫКЕ. Без исключений.
2. СТИЛЬ: Никакой воды. Никаких "Привет всем". Сразу к делу. Жесткий, динамичный монтаж.
3. ВИЗУАЛ: Для поиска видео ты должен писать КОНКРЕТНЫЕ ОПИСАНИЯ КАДРОВ НА АНГЛИЙСКОМ (для стоков).

Формат ответа: Только валидный JSON.`
    : `You are an elite viral screenwriter and visual director.
Your goal is to create vertical video scripts (TikTok/Reels) that hook attention from second 1.
Global Instruction: "${customSystemPrompt || "Create explosive content"}"

CRITICAL RULES:
1. LANGUAGE: All text, voiceover, and titles must be in ${language.toUpperCase()}.
2. STYLE: No fluff. No "Hello everyone". Straight to the point. Fast-paced editing.
3. VISUALS: For video search, write CONCRETE SCENE DESCRIPTIONS in ENGLISH (for stock libraries).

Output format: Valid JSON only.`;

  // USER PROMPT: Specific Visual Instructions
  const userPrompt = isRussian
    ? `Сгенерируй ${videoCount} сценариев на тему: "${topic}"
${audienceContext}${trafficContext}${examplesContext}

ДЛЯ КАЖДОГО СЦЕНАРИЯ (Объект JSON):
- title: Заголовок (РУ)
- hook: Хук на первые 3 сек (РУ)
- body: Основная часть, макс 2 предложения (РУ)
- cta: Призыв к действию (РУ)
- angle: Уникальный угол подачи (РУ)
- tone: "provocative" | "educational" | "emotional"
- keywords: 3-5 тегов (РУ)
- voiceover_text: Полный текст озвучки (РУ), макс 40 слов.
- duration_seconds: 15
- asset_queries: Массив из 3 поисковых запросов на АНГЛИЙСКОМ.
  ВАЖНО: Это должны быть ОПИСАНИЯ КАРТИНКИ, а не абстракции.
  ПЛОХО: "Success", "Business", "Money"
  ХОРОШО: "Close up of man counting 100 dollar bills stack", "Luxury penthouse with view of night city skyline", "Gold bars stacking animation"

JSON структура: { "scenarios": [...] }`
    : `Generate ${videoCount} scripts for topic: "${topic}"
${audienceContext}${trafficContext}${examplesContext}

FOR EACH SCENARIO (JSON Object):
- title: Catchy Title (in ${language})
- hook: First 3s hook (in ${language})
- body: Main value, max 2 sentences (in ${language})
- cta: Call to action (in ${language})
- angle: Unique angle
- tone: "provocative" | "educational" | "emotional"
- keywords: 3-5 tags
- voiceover_text: Full voiceover script (in ${language}), max 40 words.
- duration_seconds: 15
- asset_queries: Array of 3 search queries IN ENGLISH.
  CRITICAL: Must be VISUAL SCENE DESCRIPTIONS, not concepts.
  BAD: "Success", "Business"
  GOOD: "Close up of man counting 100 dollar bills stack", "Luxury penthouse with view of night city skyline"

JSON Structure: { "scenarios": [...] }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8, // Slightly lower for coherence
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
    duration_seconds: (s.duration_seconds as number) || 15,
    created_at: new Date().toISOString(),
  }));
}
