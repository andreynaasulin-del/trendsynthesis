import { NextRequest, NextResponse } from "next/server";
import { generateScenarios } from "@/lib/openai/generate-scenarios";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { topic, videoCount = 30, language = "en" } = await request.json();

    // Fetch creator settings for logged in user
    let creatorSettings = {};
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("system_prompt, target_audience, video_examples, traffic_source")
        .eq("id", user.id)
        .single();

      if (profile) {
        console.log("🎨 Using Creator Profile for generation:", user.id);
        creatorSettings = {
          systemPrompt: profile.system_prompt,
          targetAudience: profile.target_audience,
          videoExamples: profile.video_examples,
          trafficSource: profile.traffic_source,
        };
      }
    }

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    const scenarios = await generateScenarios({
      topic,
      videoCount,
      language,
      creatorSettings
    });

    return NextResponse.json({
      success: true,
      data: { scenarios, count: scenarios.length },
    });
  } catch (error) {
    console.error("Scenario generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate scenarios" },
      { status: 500 }
    );
  }
}
