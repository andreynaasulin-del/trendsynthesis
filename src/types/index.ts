// ============================================
// TRENDSYNTHESIS — Core Type Definitions V2
// Pipeline + Montage Engine + Subtitles
// ============================================

// --- User & Auth ---
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "agency";
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

// --- Project (a generation batch) ---
export interface Project {
  id: string;
  user_id: string;
  topic: string;
  status: ProjectStatus;
  video_count: number;
  style: VideoStyle;
  language: string;
  scenarios: Scenario[];
  created_at: string;
  completed_at: string | null;
}

export type ProjectStatus =
  | "idle"
  | "brainstorming"
  | "generating_scenarios"
  | "fetching_assets"
  | "composing"
  | "completed"
  | "failed";

// --- Scenario (AI-generated script for one video) ---
export interface Scenario {
  id: string;
  project_id: string;
  index: number;
  title: string;
  hook: string;
  body: string;
  cta: string;
  angle: string;
  tone: ScenarioTone;
  keywords: string[];
  asset_queries: string[];
  voiceover_text: string;
  duration_seconds: number;
  created_at: string;
}

export type ScenarioTone =
  | "professional"
  | "casual"
  | "provocative"
  | "educational"
  | "emotional";

// --- Video Clip (single clip from Pexels/Coverr) ---
export interface VideoClip {
  id: string;
  url: string;
  provider: "pexels" | "coverr" | "supabase";
  query: string;
  width: number;
  height: number;
  duration?: number;
}

// --- Montage Composition (data for Remotion) ---
export interface MontageComposition {
  id: string;
  scenario: Scenario;
  clips: VideoClip[];
  subtitles: SubtitleSegment[];
  style: MontageStyle;
  duration_frames: number;
  fps: number;
  width: number;
  height: number;
}

export interface SubtitleSegment {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  phase: "hook" | "body" | "cta";
  style?: "default" | "highlight" | "impact";
}

export interface MontageStyle {
  transition: TransitionType;
  kenBurns: boolean;
  overlayOpacity: number;
  textPosition: "center" | "bottom" | "top";
  progressBar: boolean;
  watermark: boolean;
  colorGrade: "none" | "cinematic" | "cold" | "warm" | "cyberpunk";
}

export type TransitionType = "cut" | "crossfade" | "dip-to-black" | "slide" | "zoom";

// --- Video (rendered output) ---
export interface Video {
  id: string;
  project_id: string;
  scenario_id: string;
  status: VideoRenderStatus;
  style: VideoStyle;
  file_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  resolution: string;
  file_size_bytes: number | null;
  render_progress: number;
  created_at: string;
  completed_at: string | null;
}

export type VideoRenderStatus =
  | "queued"
  | "rendering"
  | "processing"
  | "completed"
  | "failed";

export type VideoStyle = "cinematic" | "dynamic" | "minimal";

// --- Pexels Asset ---
export interface PexelsAsset {
  id: number;
  type: "video" | "photo";
  url: string;
  preview_url: string;
  width: number;
  height: number;
  duration?: number;
  photographer: string;
}

// --- Pipeline Stage (real-time tracking) ---
export interface PipelineStage {
  id: string;
  name: string;
  nameRu: string;
  status: "waiting" | "active" | "completed" | "failed";
  progress: number; // 0-100
  log: string[];
  startedAt?: number;
  completedAt?: number;
}

// --- Generation Pipeline ---
export interface GenerationRequest {
  topic: string;
  video_count: number;
  style: VideoStyle;
  language: string;
}

export interface GenerationProgress {
  project_id: string;
  stage: ProjectStatus;
  progress: number; // 0-100
  current_step: string;
  scenarios_generated: number;
  videos_rendered: number;
  total_videos: number;
}

// --- Strategy from Chat ---
export interface StrategyOption {
  id: string;
  title: string;
  hook_text: string;
  description: string;
  confidence?: number;
  estimated_views?: string;
}

// --- API Responses ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Pricing ---
export interface PricingPlan {
  id: "free" | "pro" | "agency";
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  credits: number;
  features: string[];
  highlighted?: boolean;
}
