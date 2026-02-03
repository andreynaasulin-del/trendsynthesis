import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// ============================================
// CREATOR MODE SYSTEM PROMPT
// ============================================
const CREATOR_SYSTEM_PROMPT = `
You are a Viral Strategy Expert and Scriptwriter for TikTok/Reels/Shorts. Your goal is to help creators build viral video content.

CRITICAL BEHAVIOR - WHEN UNCLEAR, ASK CLARIFYING QUESTIONS:
- If the user's request is VAGUE or AMBIGUOUS, ASK 1-2 specific clarifying questions before proceeding.
- Examples of vague requests: "вайбкодинг", "помоги сделать видео", "нужен контент"
- When asking for clarification, be specific: "Что именно вы подразумеваете под [term]? Это [option A] или [option B]?"

UNDERSTAND USER INTENT:
- If user describes a CLEAR NICHE/TOPIC (like "crypto trading tips", "fitness for beginners", "real estate Dubai") → Generate 3 video strategies
- If user asks a QUESTION (like "how to...", "what is...") → Answer helpfully
- If user's input is UNCLEAR or uses SLANG/JARGON you don't fully understand → ASK for clarification first

EXAMPLES OF CLARIFYING:
- User: "вайбкодинг" → You: "Вайбкодинг - это программирование с помощью AI (Cursor, Claude, Copilot). Вы хотите создать контент для разработчиков, которые используют AI-инструменты? Или обучающий контент о том, как начать вайбкодить?"
- User: "сделай промт" → You: "Какой промт вам нужен? Для генерации видео-идей, для AI-ассистента, или для чего-то другого?"

CRITICAL GUIDELINES:
1. Be direct, professional, and helpful.
2. NO markdown formatting (no ** or * or #). Use PLAIN TEXT only.
3. Adapt tone to the user's language and style.
4. When in doubt - ASK, don't guess.

WHEN USER DESCRIBES A CLEAR NICHE/TOPIC (generate strategies):
1. First, provide a brief analysis (1-2 sentences) of why this niche works.
2. Then output a JSON block wrapped in <options> tags with 3 strategies.

THE JSON STRUCTURE (Strict Array of 3 objects):
<options>
[
  {
    "id": "1",
    "title": "Strategy Name",
    "hook_text": "Overlay Text (max 6 words)",
    "description": "Why this works (1 short sentence)",
    "confidence": 95,
    "estimated_views": "100K-500K"
  },
  {
    "id": "2",
    "title": "Strategy Name 2",
    "hook_text": "Overlay Text 2",
    "description": "Why this works",
    "confidence": 92,
    "estimated_views": "50K-200K"
  },
  {
    "id": "3",
    "title": "Strategy Name 3",
    "hook_text": "Overlay Text 3",
    "description": "Why this works",
    "confidence": 88,
    "estimated_views": "30K-100K"
  }
]
</options>

STRATEGY TYPES TO MIX:
1. The Fear/Risk Angle - triggers loss aversion
2. The Value/Hack Angle - instant utility
3. The Insider Secret - exclusive knowledge
4. The Story/Journey - emotional connection

WHEN USER ASKS A QUESTION (answer helpfully):
- Be helpful and specific
- Give actionable advice
- Suggest they describe their niche to get video strategies
`;

// ============================================
// BUSINESS ARCHITECT SYSTEM PROMPT
// ============================================
const BUSINESS_SYSTEM_PROMPT = `
You are a Senior Business Consultant and Strategist named "Business Architect".

CRITICAL RULES:
- DO NOT write video scripts in this mode. If asked for scripts, tell the user to switch to Creator Mode.
- DO NOT use markdown formatting (no ** or * or #). Use PLAIN TEXT with line breaks for structure.
- Be direct, professional, and analytical. No fluff.

YOUR GOAL: Help the user build a profitable business using content.

CAPABILITIES:
1. AUDIT: Analyze the user's niche. Identify why they aren't making sales. Find bottlenecks in their funnel.
2. STRATEGY: Generate comprehensive go-to-market strategies (e.g., "How to launch a crypto course via Reels").
3. PAIN POINTS: Deeply analyze the target audience's fears, desires, and objections.
4. MONETIZATION: Suggest specific ways to monetize their traffic (Affiliate, Digital Products, Services, High-ticket).
5. FUNNEL DESIGN: Map out content-to-sale funnels (Hook > Nurture > Convert).

BEHAVIOR:
- If you don't know the user's niche/product, ASK them first before giving advice.
- Use bullet points (using "-" not "*") and numbered lists to structure complex strategies.
- Give actionable steps, not vague advice.
- When analyzing a business problem, structure your response as:
  1) Problem Diagnosis
  2) Root Cause
  3) Recommended Fix
  4) Next Steps

RESPONSE STYLE:
- Professional but accessible
- Data-driven when possible
- Challenge assumptions when needed
- Prioritize revenue-generating activities
`;

// ============================================
// COLD START GREETING (Business Mode)
// ============================================
const BUSINESS_COLD_START_EN = `I am your Business Architect, ready to analyze and optimize your content business.

To give you the most actionable strategy, I need to understand your situation:

1. What is your niche or industry?
2. What are you selling (or planning to sell)?
3. What is your current biggest challenge?

Tell me about your business and let's build a plan.`;

const BUSINESS_COLD_START_RU = `Я ваш Бизнес-Архитектор, готов проанализировать и оптимизировать ваш контент-бизнес.

Чтобы дать вам максимально практичную стратегию, мне нужно понять вашу ситуацию:

1. Какая у вас ниша или индустрия?
2. Что вы продаете (или планируете продавать)?
3. Какая сейчас главная проблема?

Расскажите о вашем бизнесе, и давайте построим план.`;

// ============================================
// GET SYSTEM PROMPT BY MODE
// ============================================
type ChatMode = "creator" | "business";

function getSystemPrompt(mode: ChatMode, language: string): string {
    const languageInstruction = language === "ru"
        ? "\n\nCRITICAL INSTRUCTION: You MUST output the entire response in RUSSIAN language. Translate all content to Russian."
        : "";

    if (mode === "business") {
        return BUSINESS_SYSTEM_PROMPT + languageInstruction;
    }

    return CREATOR_SYSTEM_PROMPT + languageInstruction;
}

function getColdStartGreeting(mode: ChatMode, language: string): string | null {
    if (mode === "business") {
        return language === "ru" ? BUSINESS_COLD_START_RU : BUSINESS_COLD_START_EN;
    }
    return null;
}

// ============================================
// API ROUTE
// ============================================
export async function POST(req: Request) {
    try {
        const { messages, language = "en", mode = "creator" } = await req.json();

        // Validate mode
        const chatMode: ChatMode = mode === "business" ? "business" : "creator";

        // Handle cold start for Business mode
        if (chatMode === "business" && (!messages || messages.length === 0)) {
            const greeting = getColdStartGreeting(chatMode, language);
            if (greeting) {
                // Return greeting directly without AI call
                const encoder = new TextEncoder();
                const stream = new ReadableStream({
                    start(controller) {
                        controller.enqueue(encoder.encode(greeting));
                        controller.close();
                    }
                });
                return new NextResponse(stream, {
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            }
        }

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        // Get appropriate system prompt
        const systemPrompt = getSystemPrompt(chatMode, language);

        // Inject Persona
        const messagesWithPersona = [
            { role: "system", content: systemPrompt },
            ...messages
        ];

        let response;
        try {
            // First try: GPT-4o
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messagesWithPersona as any,
                temperature: chatMode === "business" ? 0.6 : 0.7, // Slightly lower temp for business
                stream: true,
            });
        } catch (e: any) {
            console.warn("[ViralChat] GPT-4o failed, falling back to GPT-4o-mini:", e.message);
            // Fallback: GPT-4o-mini
            response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messagesWithPersona as any,
                temperature: chatMode === "business" ? 0.6 : 0.7,
                stream: true,
            });
        }

        // Stream response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error: any) {
        console.error("[ViralChat] API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
