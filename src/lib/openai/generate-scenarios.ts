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
  language = "ru", // Дефолт теперь не важен, так как мы починили кнопку
  creatorSettings,
}: GenerateScenariosParams): Promise<Scenario[]> {

  // Вот тут теперь будет TRUE, если нажата кнопка RU
  const isRussian = language === "ru";

  // Собираем контекст пользователя
  const contextBlock = `
  CONTEXT:
  - Niche: ${creatorSettings?.niche || "General Business"}
  - Goal: ${creatorSettings?.goal || "Viral Reach"}
  - Audience: ${creatorSettings?.targetAudience || "Broad"}
  `;

  // --- ЖЕСТКИЙ СИСТЕМНЫЙ ПРОМПТ ---
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
   - CTA: Призыв подписаться.`

    : `ROLE: You are an elite Viral Architect.
${contextBlock}
RULES:
- Generate high-retention scripts in English.
- Use detailed visual descriptions for 'asset_queries' (min 3 adjectives).`;

  // --- ЗАПРОС ПОЛЬЗОВАТЕЛЯ ---
  const userPrompt = isRussian
    ? `Сгенерируй ${videoCount} сценариев на тему: "${topic}".
    
    ВЫВОД JSON (Strict Structure):
    {
      "scenarios": [
        {
          "title": "Заголовок (РУ)",
          "hook": "Текст на экране (РУ)",
          "body": "Текст сценария (РУ)",
          "cta": "Призыв (РУ)",
          "angle": "Unique angle",
          "voiceover_text": "Полный текст озвучки (РУ, только кириллица)",
          "asset_queries": [
            "DETAILED SCENE 1 DESCRIPTION IN ENGLISH (Cinematic)",
            "DETAILED SCENE 2 DESCRIPTION IN ENGLISH (Cinematic)",
            "DETAILED SCENE 3 DESCRIPTION IN ENGLISH (Cinematic)"
          ]
        }
      ]
    }`
    : `Generate ${videoCount} scripts for topic "${topic}" in JSON format.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const parsed = JSON.parse(content);
  const scenarios = parsed.scenarios || parsed;

  return scenarios.map((s: any, index: number) => ({
    id: `scenario-${Date.now()}-${index}`,
    project_id: "", // Added to match interface
    index,
    title: s.title || "Untitled",
    hook: s.hook || "",
    body: s.body || "",
    cta: s.cta || "",
    // Гарантируем, что ассеты — массив, и добавляем стиль, если ИИ забыл
    asset_queries: (s.asset_queries || [s.hook]).map((q: string) =>
      q.includes("cinematic") ? q : `${q}, cinematic, 4k, dark mode`
    ),
    voiceover_text: s.voiceover_text || "",
    duration_seconds: 15,
    keywords: [],
    angle: s.angle || "Viral",
    tone: "provocative" as const, // Fixed type
    created_at: new Date().toISOString(),
  }));
}
