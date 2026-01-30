// ============================================
// TRENDSYNTHESIS — Core Type Definitions
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
  created_at: string;
  completed_at: string | null;
}

export type ProjectStatus =
  | "pending"
  | "parsing"
  | "generating_scenarios"
  | "fetching_assets"
  | "rendering"
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
