// ============================================
// TRENDSYNTHESIS — Composition Builder
// Converts Scenario → MontageComposition with assets & subtitles
// ============================================

import type { Scenario, MontageComposition, VideoClip, SubtitleSegment, MontageStyle, VideoStyle } from "@/types";
import { searchVideos } from "@/lib/pexels/search-assets";
import { v4 as uuid } from "uuid";

// --- Default Config ---
const FPS = 30;
const DEFAULT_DURATION_SECONDS = 15;
const CLIPS_PER_VIDEO = 6; // 6 clips for 15s = 2.5s per clip

// --- Style Presets ---
const STYLE_PRESETS: Record<VideoStyle, MontageStyle> = {
  cinematic: {
    transition: "crossfade",
    kenBurns: true,
    overlayOpacity: 0.4,
    textPosition: "bottom",
    progressBar: true,
    watermark: true,
    colorGrade: "cinematic",
  },
  dynamic: {
    transition: "cut",
    kenBurns: false,
    overlayOpacity: 0.35,
    textPosition: "center",
    progressBar: true,
    watermark: true,
    colorGrade: "cyberpunk",
  },
  minimal: {
    transition: "dip-to-black",
    kenBurns: true,
    overlayOpacity: 0.5,
    textPosition: "bottom",
    progressBar: false,
    watermark: false,
    colorGrade: "cold",
  },
};

// --- Subtitle Generator ---
function generateSubtitles(scenario: Scenario, durationFrames: number): SubtitleSegment[] {
  const subtitles: SubtitleSegment[] = [];
  
  // Phase distribution: Hook 20%, Body 60%, CTA 20%
  const hookEnd = Math.floor(durationFrames * 0.2);
  const bodyEnd = Math.floor(durationFrames * 0.8);
  
  // HOOK phase
  if (scenario.hook) {
    subtitles.push({
      id: uuid(),
      text: scenario.hook,
      startFrame: 0,
      endFrame: hookEnd,
      phase: "hook",
      style: "impact",
    });
  }
  
  // BODY phase - split into segments if long
  if (scenario.body) {
    const bodyDuration = bodyEnd - hookEnd;
    const bodySentences = scenario.body.split(/[.!?]+/).filter(s => s.trim());
    const segmentDuration = Math.floor(bodyDuration / Math.max(bodySentences.length, 1));
    
    bodySentences.forEach((sentence, index) => {
      subtitles.push({
        id: uuid(),
        text: sentence.trim(),
        startFrame: hookEnd + (index * segmentDuration),
        endFrame: hookEnd + ((index + 1) * segmentDuration),
        phase: "body",
        style: index === 0 ? "highlight" : "default",
      });
    });
  }
  
  // CTA phase
  if (scenario.cta) {
    subtitles.push({
      id: uuid(),
      text: scenario.cta,
      startFrame: bodyEnd,
      endFrame: durationFrames,
      phase: "cta",
      style: "impact",
    });
  }
  
  return subtitles;
}

// --- Fetch Clips for Scenario ---
async function fetchClipsForScenario(scenario: Scenario): Promise<VideoClip[]> {
  const clips: VideoClip[] = [];
  const queries = scenario.asset_queries || [];
  
  if (queries.length === 0) {
    // Fallback to keywords
    queries.push(...(scenario.keywords || []).slice(0, 3));
  }
  
  // Fetch 2 videos per query to get enough clips
  const clipsPerQuery = Math.ceil(CLIPS_PER_VIDEO / queries.length);
  
  for (const query of queries) {
    try {
      const results = await searchVideos(query, clipsPerQuery);
      
      for (const asset of results) {
        clips.push({
          id: String(asset.id),
          url: asset.url,
          provider: "pexels",
          query,
          width: asset.width,
          height: asset.height,
          duration: asset.duration,
        });
      }
      
      // Stop if we have enough
      if (clips.length >= CLIPS_PER_VIDEO) break;
    } catch (error) {
      console.warn(`[CompositionBuilder] Failed to fetch clips for query "${query}":`, error);
    }
  }
  
  // Ensure we have at least some clips, dedupe by id
  const uniqueClips = clips.filter((clip, index, self) => 
    index === self.findIndex(c => c.id === clip.id)
  );
  
  return uniqueClips.slice(0, CLIPS_PER_VIDEO);
}

// --- Main Builder Function ---
export async function buildComposition(
  scenario: Scenario,
  style: VideoStyle = "cinematic",
  userPlan: string = "free"
): Promise<MontageComposition> {
  const durationSeconds = scenario.duration_seconds || DEFAULT_DURATION_SECONDS;
  const durationFrames = durationSeconds * FPS;

  // 1. Fetch video clips
  const clips = await fetchClipsForScenario(scenario);

  // 2. Generate subtitles
  const subtitles = generateSubtitles(scenario, durationFrames);

  // 3. Get style preset
  const montageStyle = { ...STYLE_PRESETS[style] } || { ...STYLE_PRESETS.cinematic };

  // 4. FORCE WATERMARK for free users (cannot be disabled)
  const isFreeUser = userPlan === "free";
  if (isFreeUser) {
    montageStyle.watermark = true;
  }

  return {
    id: uuid(),
    scenario,
    clips,
    subtitles,
    style: montageStyle,
    duration_frames: durationFrames,
    fps: FPS,
    width: 1080,
    height: 1920,
    // Add userPlan for watermark control in Remotion
    userPlan: userPlan as MontageComposition["userPlan"],
  };
}

// --- Batch Builder ---
export async function buildCompositions(
  scenarios: Scenario[],
  style: VideoStyle = "cinematic"
): Promise<MontageComposition[]> {
  const compositions: MontageComposition[] = [];
  
  // Process sequentially to avoid rate limits
  for (const scenario of scenarios) {
    try {
      const composition = await buildComposition(scenario, style);
      compositions.push(composition);
      
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`[CompositionBuilder] Failed to build composition for scenario ${scenario.id}:`, error);
    }
  }
  
  return compositions;
}
