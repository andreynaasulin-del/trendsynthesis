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

MANDATORY RULES (CRITICAL):
1. LANGUAGE (MANDATORY): Ты обязан генерировать script_text, hook, body, cta СТРОГО НА РУССКОМ ЯЗЫКЕ.
   - Даже если тема "Marketing" или "IT", НЕЛЬЗЯ использовать английские предложения.
   - Переводи всё. Если ты напишешь хоть одно предложение на английском в тексте сценария, система упадёт.
   - ЗАПРЕЩЕНО: "Why are 90% of people..."
   - РАЗРЕШЕНО: "Почему 90% людей совершают эту ошибку..."

2. VISUAL ENHANCER (ASSETS):
   - Ты должен генерировать поле asset_queries как "Visual Director".
   - ЗАПРЕЩЕНЫ односложные запросы ("Money", "Business", "Office").
   - ОБЯЗАТЕЛЬНО: Используй минимум 3 прилагательных в каждом запросе.
   - Описывай сцену детально: освещение, действие, эмоцию.
   - Пример: "stressed businessman pulling hair in dark office cinematic lighting", "close up of burning US dollar bill slow motion".

Формат ответа: Только валидный JSON.`
    : `You are an elite viral screenwriter and visual director.
Your goal is to create vertical video scripts (TikTok/Reels) that hook attention from second 1.
Global Instruction: "${customSystemPrompt || "Create explosive content"}"

CRITICAL RULES:
1. LANGUAGE: All text, voiceover, and titles must be in ${language.toUpperCase()}.
2. VISUALS: For video search, write CONCRETE SCENE DESCRIPTIONS in ENGLISH (for stock libraries).
   - REJECT single-word queries (e.g., "Money").
   - REQUIRE at least 3 adjectives per query.
   - Example: "stressed businessman pulling hair in dark office cinematic lighting".

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
- voiceover_text: Полный текст озвучки (РУ), транслитерация ЗАПРЕЩЕНА. Только кириллица.
- duration_seconds: 15
- asset_queries: Массив из 3 поисковых запросов на АНГЛИЙСКОМ.
  ВАЖНО: "Visual Enhancer" включен.
  ❌ BAD: "Success", "Business", "Money"
  ✅ GOOD: "Close up of man counting 100 dollar bills stack cinematic", "Luxury penthouse with view of night city skyline 8k", "Gold bars stacking animation 3d render"

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
  CRITICAL: Must be VISUAL SCENE DESCRIPTIONS with adjectives.
  BAD: "Success", "Business"
  GOOD: "Close up of man counting 100 dollar bills stack cinematic", "Luxury penthouse with view of night city skyline 8k"

JSON Structure: { "scenarios": [...] }`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7, // STRICT adherence
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
