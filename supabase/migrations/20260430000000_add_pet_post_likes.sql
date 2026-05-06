-- Post Like System
-- Adds pet_post_likes table, like_count on pet_posts, triggers, and RLS policies.
-- ============================================================================

-- 1. Add like_count column to pet_posts
-- ============================================================================
ALTER TABLE public.pet_posts
  ADD COLUMN IF NOT EXISTS like_count INT NOT NULL DEFAULT 0;

-- 2. Create pet_post_likes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pet_post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_post_id UUID NOT NULL REFERENCES public.pet_posts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, pet_post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pet_post_likes_post_id ON public.pet_post_likes(pet_post_id);
CREATE INDEX IF NOT EXISTS idx_pet_post_likes_profile_id ON public.pet_post_likes(profile_id);

-- 3. Trigger: auto-update like_count on pet_posts
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_pet_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pet_posts SET like_count = like_count + 1 WHERE id = NEW.pet_post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pet_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.pet_post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_pet_post_like_count ON public.pet_post_likes;
CREATE TRIGGER trg_update_pet_post_like_count
  AFTER INSERT OR DELETE ON public.pet_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pet_post_like_count();

-- 4. RLS Policies
-- ============================================================================
ALTER TABLE public.pet_post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "pet_post_likes_select" ON public.pet_post_likes
  FOR SELECT USING (true);

-- Users can only insert their own likes
CREATE POLICY "pet_post_likes_insert" ON public.pet_post_likes
  FOR INSERT WITH CHECK (
    profile_id = public.get_active_profile_id()
  );

-- Users can only delete their own likes
CREATE POLICY "pet_post_likes_delete" ON public.pet_post_likes
  FOR DELETE USING (
    profile_id = public.get_active_profile_id()
  );

-- 5. Refresh activity feed on like changes (optional — uncomment if desired)
-- ============================================================================
-- DROP TRIGGER IF EXISTS refresh_feed_on_post_like_change ON public.pet_post_likes;
-- CREATE TRIGGER refresh_feed_on_post_like_change
--   AFTER INSERT OR DELETE ON public.pet_post_likes
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION public.trigger_refresh_activity_feed();
