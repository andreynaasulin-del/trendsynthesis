import { NextRequest, NextResponse } from "next/server";
import { generateScenarios } from "@/lib/openai/generate-scenarios";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { topic, videoCount = 30, language = "en" } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    const scenarios = await generateScenarios({ topic, videoCount, language });

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
