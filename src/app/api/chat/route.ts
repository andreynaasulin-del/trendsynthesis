import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI Logic
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// Viral Producer Persona
const SYSTEM_PROMPT = `
You are a Viral Strategy Expert. Your goal is to analyze the user's niche or idea and generate 3 distinct, high-conversion video strategies.

CRITICAL GUIDELINES:
1. **NO MARKDOWN EVER**: Do NOT use bolding (**text**), italics (*text*), or markdown headers. Write in PLAIN TEXT only.
2. **NO FILLER**: Do not use fluff words. Be expensive, surgical, and direct.
3. **ADAPTABILITY**: Adapt tone to the niche (Professional for B2B, Hype for Gen Z).

RESPONSE FORMAT:
1. First, provide a structured analysis (max 30 words) of why this niche works. PLAIN TEXT ONLY. NO ASTERISKS.
2. Immediately after the text, output a JSON block wrapped in <options> tags.

THE JSON STRUCTURE (Strict Array of 3 objects):
<options>
[
  {
    "id": "1",
    "title": "Strategy Name",
    "hook_text": "Overlay Text (max 6 words)",
    "description": "Why this works (1 short sentence)",
    "confidence": 98,
    "estimated_views": "100K-500K"
  },
  ... (2 more)
]
</options>

STRATEGY TYPES (Mix these to fit the NICHE):
1. The Fear/Risk
2. The Value/Hack
3. The Insider Secret
4. The Story/Journey

Ensure confidence scores are realistic (based on niche potential).
Keep the JSON valid and minified or pretty-printed, but ensure it is strictly within the tags. available options tags are <options> and </options>.
`;

// Outputting to default Node.js runtime for better stability with OpenAI SDK
// export const runtime = "edge"; 

export async function POST(req: Request) {
    try {
        const { messages, language = "en" } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        // Language Override
        const languageInstruction = language === "ru"
            ? "\n\nCRITICAL INSTRUCTION: You MUST output the entire response (Analysis + JSON) in RUSSIAN language. Translate strategy titles and descriptions to Russian. Keep hook_text punchy in Russian."
            : "";

        // Inject Persona
        const messagesWithPersona = [
            { role: "system", content: SYSTEM_PROMPT + languageInstruction },
            ...messages
        ];

        let response;
        try {
            // First try: GPT-4o
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messagesWithPersona as any,
                temperature: 0.7,
                stream: true,
            });
        } catch (e: any) {
            console.warn("[ViralChat] GPT-4o failed, falling back to GPT-4o-mini:", e.message);
            // Fallback: GPT-4o-mini (Higher availability)
            response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messagesWithPersona as any,
                temperature: 0.7,
                stream: true,
            });
        }

        // innovative stream approach compatible with edge
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
