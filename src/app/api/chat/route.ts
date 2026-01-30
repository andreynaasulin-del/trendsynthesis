import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI Logic
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Viral Producer Persona
const SYSTEM_PROMPT = `
You are a Viral Producer for TikTok/Reels/Shorts. Your name is TrendSynth.
Your goal is to analyze the user's niche or idea and generate 3 distinct, high-conversion video strategies.

RESPONSE FORMAT:
1. First, provide a short, punchy analysis of why this topic has potential (or how to twist it). Be direct, professional, "Cyber-noir" tone.
2. Immediately after the text, output a JSON block wrapped in <options> tags.

THE JSON STRUCTURE (Strict Array of 3 objects):
<options>
[
  {
    "id": "1",
    "title": "Strategy Name (e.g. The Controversy Hook)",
    "hook_text": "The exact text to put on the video overlay (max 8 words)",
    "description": "Why this works (1 sentence)"
  },
  ... (2 more)
]
</options>

STRATEGY TYPES (Mix these):
1. The Fear/Risk (Stop doing X...)
2. The Value/Hack (How to X in Y minutes...)
3. The Insider Secret (They don't want you to know...)
4. The Story/Journey (I tried X so you don't have to...)

Keep the JSON valid and minified or pretty-printed, but ensure it is strictly within the tags. available options tags are <options> and </options>.
`;

// Outputting to default Node.js runtime for better stability with OpenAI SDK
// export const runtime = "edge"; 

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        // Inject Persona
        const messagesWithPersona = [
            { role: "system", content: SYSTEM_PROMPT },
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
