-- ============================================
-- TRENDSYNTHESIS Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Users profile (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  credits_remaining INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (generation batches)
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'parsing', 'generating_scenarios', 'fetching_assets', 'rendering', 'completed', 'failed')),
  video_count INTEGER DEFAULT 30,
  style TEXT DEFAULT 'cinematic' CHECK (style IN ('cinematic', 'dynamic', 'minimal')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Scenarios (AI-generated scripts)
CREATE TABLE public.scenarios (
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
  duration_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos (rendered outputs)
CREATE TABLE public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'processing', 'completed', 'failed')),
  style TEXT DEFAULT 'cinematic',
  file_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  resolution TEXT DEFAULT '1080x1920',
  file_size_bytes BIGINT,
  render_progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scenarios" ON public.scenarios FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own videos" ON public.videos FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_scenarios_project_id ON public.scenarios(project_id);
CREATE INDEX idx_videos_project_id ON public.videos(project_id);
CREATE INDEX idx_videos_status ON public.videos(status);
