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
-- FUNCTIONS & RPC
-- ============================================

-- Atomic Credit Adjustment (Refunds / Bonuses)
CREATE OR REPLACE FUNCTION increment_credits(user_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET credits_remaining = credits_remaining + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Atomic Credit Decrement
CREATE OR REPLACE FUNCTION decrement_credits(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits_remaining = GREATEST(0, credits_remaining - 1),
      updated_at = NOW()
  WHERE id = user_id
  RETURNING credits_remaining INTO new_balance;
  
  RETURN new_balance;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Scenarios
DROP POLICY IF EXISTS "Users can view scenarios of own projects" ON public.scenarios;
CREATE POLICY "Users can view scenarios of own projects" ON public.scenarios FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

-- Videos
DROP POLICY IF EXISTS "Users can view videos of own projects" ON public.videos;
CREATE POLICY "Users can view videos of own projects" ON public.videos FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

-- Usage Logs
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_logs;
CREATE POLICY "Users can view own usage" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE POLICIES (Required for App Functionality)
-- Profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Scenarios
DROP POLICY IF EXISTS "Users can create scenarios" ON public.scenarios;
CREATE POLICY "Users can create scenarios" ON public.scenarios FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update scenarios" ON public.scenarios;
CREATE POLICY "Users can update scenarios" ON public.scenarios FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

-- Videos
DROP POLICY IF EXISTS "Users can create videos" ON public.videos;
CREATE POLICY "Users can create videos" ON public.videos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update videos" ON public.videos;
CREATE POLICY "Users can update videos" ON public.videos FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);