-- ============================================
-- TRENDSYNTHESIS Database Schema V2
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- TABLE DEFINITIONS
-- ============================================

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  credits_remaining INTEGER DEFAULT 1,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Creator Settings
  niche TEXT, -- New field
  goal TEXT, -- New field
  system_prompt TEXT DEFAULT 'You are a viral content strategist.',
  target_audience TEXT DEFAULT 'General audience',
  video_examples TEXT[] DEFAULT '{}',
  traffic_source TEXT DEFAULT 'tiktok' CHECK (traffic_source IN ('tiktok', 'instagram', 'youtube', 'telegram')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (generation batches)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('idle', 'pending', 'brainstorming', 'generating_scenarios', 'fetching_assets', 'composing', 'rendering', 'completed', 'failed')),
  video_count INTEGER DEFAULT 6,
  style TEXT DEFAULT 'cinematic' CHECK (style IN ('cinematic', 'dynamic', 'minimal')),
  language TEXT DEFAULT 'en',
  strategy_title TEXT,
  strategy_hook TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Scenarios (AI-generated scripts)
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  index INTEGER NOT NULL,
  title TEXT NOT NULL,
  hook TEXT,
  body TEXT,
  cta TEXT,
  angle TEXT,
  tone TEXT DEFAULT 'casual',
  keywords TEXT[] DEFAULT '{}',
  asset_queries TEXT[] DEFAULT '{}',
  voiceover_text TEXT,
  duration_seconds INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos (rendered outputs)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'processing', 'completed', 'failed')),
  style TEXT DEFAULT 'cinematic',
  file_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 15,
  resolution TEXT DEFAULT '1080x1920',
  file_size_bytes BIGINT,
  render_progress INTEGER DEFAULT 0,
  remotion_render_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Usage tracking
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  credits_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
