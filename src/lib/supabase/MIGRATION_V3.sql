-- ============================================
-- TRENDSYNTHESIS — V3 Migration Fix
-- Apply these changes in Supabase SQL Editor
-- ============================================

-- 1. Fix Missing RPC Function: decrement_credits
CREATE OR REPLACE FUNCTION decrement_credits(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Atomic decrement, preventing negative balance
  UPDATE public.profiles
  SET credits_remaining = GREATEST(0, credits_remaining - 1),
      updated_at = NOW()
  WHERE id = user_id
  RETURNING credits_remaining INTO new_balance;
  
  RETURN new_balance;
END;
$$;

-- 2. Add Missing INSERT Policies (RLS)
-- Profiles: Allow users to create their own profile on signup
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Scenarios: Allow users to create scenarios for their projects
DROP POLICY IF EXISTS "Users can create scenarios" ON public.scenarios;
CREATE POLICY "Users can create scenarios" ON public.scenarios FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND user_id = auth.uid()
    )
);

-- Videos: Allow users to create videos for their projects
DROP POLICY IF EXISTS "Users can create videos" ON public.videos;
CREATE POLICY "Users can create videos" ON public.videos FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND user_id = auth.uid()
    )
);

-- Usage Logs: Allow users to create usage logs
DROP POLICY IF EXISTS "Users can create usage logs" ON public.usage_logs;
CREATE POLICY "Users can create usage logs" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Add UPDATE Policies (RLS)
-- Scenarios: Allow users to update their own scenarios
DROP POLICY IF EXISTS "Users can update scenarios" ON public.scenarios;
CREATE POLICY "Users can update scenarios" ON public.scenarios FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND user_id = auth.uid()
    )
);

-- Videos: Allow users to update their own videos (e.g. status)
DROP POLICY IF EXISTS "Users can update videos" ON public.videos;
CREATE POLICY "Users can update videos" ON public.videos FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = project_id 
        AND user_id = auth.uid()
    )
);