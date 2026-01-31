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
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'agency')),
  credits_remaining INTEGER DEFAULT 1,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
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

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can create scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can view own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can create videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_logs;

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Project policies
CREATE POLICY "Users can view own projects" ON public.projects 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON public.projects 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects 
  FOR DELETE USING (auth.uid() = user_id);

-- Scenario policies
CREATE POLICY "Users can view own scenarios" ON public.scenarios 
  FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can create scenarios" ON public.scenarios 
  FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Video policies
CREATE POLICY "Users can view own videos" ON public.videos 
  FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can create videos" ON public.videos 
  FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own videos" ON public.videos 
  FOR UPDATE USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- Usage log policies
CREATE POLICY "Users can view own usage" ON public.usage_logs 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Decrement credits function
CREATE OR REPLACE FUNCTION public.decrement_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  UPDATE public.profiles 
  SET credits_remaining = credits_remaining - 1,
      updated_at = NOW()
  WHERE id = p_user_id AND credits_remaining > 0
  RETURNING credits_remaining INTO current_credits;
  
  -- Log the usage
  INSERT INTO public.usage_logs (user_id, action, credits_used)
  VALUES (p_user_id, 'generation', 1);
  
  RETURN COALESCE(current_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits function (for purchases)
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  UPDATE public.profiles 
  SET credits_remaining = credits_remaining + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits_remaining INTO new_credits;
  
  -- Log the addition
  INSERT INTO public.usage_logs (user_id, action, credits_used, metadata)
  VALUES (p_user_id, 'credits_added', -p_amount, jsonb_build_object('amount', p_amount));
  
  RETURN COALESCE(new_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update plan function
CREATE OR REPLACE FUNCTION public.update_user_plan(
  p_user_id UUID, 
  p_plan TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  credits_to_add INTEGER;
BEGIN
  -- Determine credits based on plan
  credits_to_add := CASE p_plan
    WHEN 'creator' THEN 20
    WHEN 'agency' THEN 9999
    ELSE 1
  END;
  
  UPDATE public.profiles 
  SET 
    plan = p_plan,
    credits_remaining = credits_to_add,
    stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the plan change
  INSERT INTO public.usage_logs (user_id, action, metadata)
  VALUES (p_user_id, 'plan_changed', jsonb_build_object('plan', p_plan));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_project_id ON public.scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_videos_project_id ON public.videos(project_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);

-- ============================================
-- STORAGE BUCKETS (run separately)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- Storage policies
-- CREATE POLICY "Users can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
-- CREATE POLICY "Videos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
