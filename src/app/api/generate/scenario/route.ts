import { NextRequest, NextResponse } from "next/server";
import { generateScenarios } from "@/lib/openai/generate-scenarios";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}`;
  console.log(`[${requestId}] 🚀 POST /api/generate/scenario started`);

  try {
    const body = await request.json();
    console.log(`[${requestId}] Body received:`, JSON.stringify(body).slice(0, 100));

    const { topic, videoCount = 30, language = "en" } = body;

    // Fetch creator settings for logged in user
    let creatorSettings = {};
    const supabase = await createServerSupabaseClient();
    console.log(`[${requestId}] Supabase client created. Fetching user...`);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) console.error(`[${requestId}] Auth error:`, authError);
    if (user) console.log(`[${requestId}] User found: ${user.id}`);
    else console.log(`[${requestId}] No user logged in (anonymous generation)`);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("system_prompt, target_audience, video_examples, traffic_source")
        .eq("id", user.id)
        .single();

      if (profile) {
        console.log(`[${requestId}] 🎨 Using Creator Profile`);
        creatorSettings = {
          systemPrompt: profile.system_prompt,
          targetAudience: profile.target_audience,
          videoExamples: profile.video_examples,
          trafficSource: profile.traffic_source,
        };
      }
    }

    if (!topic || typeof topic !== "string") {
      console.warn(`[${requestId}] ❌ Missing topic`);
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] 🧠 Starting AI generation (Count: ${videoCount}, Lang: ${language})`);
    const scenarios = await generateScenarios({
      topic,
      videoCount,
      language,
      creatorSettings
    });
    console.log(`[${requestId}] ✅ AI Generation complete. Scenarios: ${scenarios.length}`);

    return NextResponse.json({
      success: true,
      data: { scenarios, count: scenarios.length },
    });
  } catch (error: any) {
    console.error(`[${requestId}] 💥 Scenario generation CRITICAL ERROR:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate scenarios" },
      { status: 500 }
    );
  }
}
