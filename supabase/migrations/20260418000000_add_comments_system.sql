-- ============================================================================
-- NESTED COMMENTS SYSTEM WITH GAMIFICATION
-- Created: 2026-04-18
-- Description: Self-referencing comment threads with full gamification support
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE public.comment_reaction_type AS ENUM ('like', 'helpful', 'insightful', 'heart');

-- ============================================================================
-- 1. COMMENTS TABLE: Nested thread structure with self-reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_post_id UUID NOT NULL REFERENCES public.pet_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Self-referencing for infinite nesting
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 2000),
  
  -- Metadata
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Soft delete (preserve thread structure)
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_reason TEXT, -- 'self', 'moderator', 'system'
  
  -- Engagement tracking
  reply_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_pet_post ON public.comments(pet_post_id);
CREATE INDEX IF NOT EXISTS idx_comments_profile ON public.comments(profile_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON public.comments(pet_post_id, parent_comment_id, created_at);

-- ============================================================================
-- 2. COMMENT LIKES TABLE: Track who liked which comment
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(comment_id, profile_id) -- One like per user per comment
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_profile ON public.comment_likes(profile_id);

-- ============================================================================
-- 3. COMMENT REACTIONS TABLE: Extended reactions (helpful, insightful, heart)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type public.comment_reaction_type NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(comment_id, profile_id) -- One reaction per user per comment
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_type ON public.comment_reactions(reaction_type);

-- ============================================================================
-- 4. COMMENT GAMIFICATION LOG: Audit trail for gamification events
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comment_gamification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL, -- 'comment_created', 'reply_received', 'like_received', 'helpful_marked'
  points_awarded INTEGER NOT NULL DEFAULT 0,
  
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_gamification_profile ON public.comment_gamification_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_comment_gamification_action ON public.comment_gamification_log(action);
CREATE INDEX IF NOT EXISTS idx_comment_gamification_created ON public.comment_gamification_log(created_at);

-- ============================================================================
-- 5. USER COMMENT STATS: Pre-aggregated stats for badges/checking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_comment_stats (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic stats
  total_comments INTEGER NOT NULL DEFAULT 0,
  total_replies INTEGER NOT NULL DEFAULT 0, -- Comments that are replies
  total_received_replies INTEGER NOT NULL DEFAULT 0, -- Replies received
  
  -- Engagement
  total_likes_received INTEGER NOT NULL DEFAULT 0,
  total_likes_given INTEGER NOT NULL DEFAULT 0,
  total_helpful_received INTEGER NOT NULL DEFAULT 0,
  
  -- Quality indicators
  avg_reply_depth NUMERIC(3,1) NOT NULL DEFAULT 0, -- Average depth of replies to their comments
  helpful_comments INTEGER NOT NULL DEFAULT 0, -- Comments marked as helpful
  
  -- Streak tracking
  current_comment_streak INTEGER NOT NULL DEFAULT 0, -- Days with at least 1 comment
  longest_comment_streak INTEGER NOT NULL DEFAULT 0,
  last_comment_date DATE,
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_comment_stats_streak ON public.user_comment_stats(current_comment_streak DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comments: Anyone can read, authenticated can create
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND profile_id = public.get_active_profile_id()
  );

-- Users can edit their own non-deleted comments
CREATE POLICY "Users can edit their own comments"
  ON public.comments FOR UPDATE
  USING (
    profile_id = public.get_active_profile_id()
    AND is_deleted = FALSE
  )
  WITH CHECK (profile_id = public.get_active_profile_id());

-- Likes: Anyone can read, authenticated can like
CREATE POLICY "Comment likes are viewable by everyone"
  ON public.comment_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND profile_id = public.get_active_profile_id()
  );

CREATE POLICY "Users can remove their own likes"
  ON public.comment_likes FOR DELETE
  USING (profile_id = public.get_active_profile_id());

-- Reactions: Same as likes
CREATE POLICY "Comment reactions are viewable by everyone"
  ON public.comment_reactions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react to comments"
  ON public.comment_reactions FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND profile_id = public.get_active_profile_id()
  );

CREATE POLICY "Users can remove their own reactions"
  ON public.comment_reactions FOR DELETE
  USING (profile_id = public.get_active_profile_id());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update comment stats after insert/update/delete
CREATE OR REPLACE FUNCTION public.update_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update user stats
    INSERT INTO public.user_comment_stats (profile_id, total_comments, last_comment_date)
    VALUES (NEW.profile_id, 1, CURRENT_DATE)
    ON CONFLICT (profile_id) DO UPDATE SET
      total_comments = public.user_comment_stats.total_comments + 1,
      last_comment_date = CURRENT_DATE,
      updated_at = NOW();
    
    -- Update reply count if this is a reply
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE public.comments 
      SET reply_count = reply_count + 1 
      WHERE id = NEW.parent_comment_id;
      
      -- Update reply stats for both users
      UPDATE public.user_comment_stats ucs
      SET total_replies = total_replies + 1,
          updated_at = NOW()
      WHERE ucs.profile_id = NEW.profile_id;
      
      -- Update parent's author stats (received reply)
      UPDATE public.user_comment_stats ucs
      SET total_received_replies = total_received_replies + 1,
          updated_at = NOW()
      FROM public.comments pc
      WHERE pc.id = NEW.parent_comment_id
        AND ucs.profile_id = pc.profile_id;
    END IF;
    
    -- Update streak
    PERFORM public.check_and_update_comment_streak(NEW.profile_id);
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_edited = TRUE AND OLD.is_edited = FALSE THEN
      NEW.edited_at = NOW();
    END IF;
    
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
      NEW.deleted_at = NOW();
      
      -- Decrement parent's reply_count if this was a reply
      IF NEW.parent_comment_id IS NOT NULL THEN
        UPDATE public.comments 
        SET reply_count = GREATEST(0, reply_count - 1) 
        WHERE id = NEW.parent_comment_id;
        
        -- Decrement stats
        UPDATE public.user_comment_stats
        SET total_replies = GREATEST(0, total_replies - 1),
            updated_at = NOW()
        WHERE profile_id = NEW.profile_id;
        
        UPDATE public.user_comment_stats ucs
        SET total_received_replies = GREATEST(0, total_received_replies - 1),
            updated_at = NOW()
        FROM public.comments pc
        WHERE pc.id = NEW.parent_comment_id
          AND ucs.profile_id = pc.profile_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_comment_stats
  AFTER INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_stats();

-- Function: Award points for comment actions
CREATE OR REPLACE FUNCTION public.award_comment_points(
  p_profile_id UUID,
  p_action TEXT,
  p_comment_id UUID DEFAULT NULL,
  p_points INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER := p_points;
  v_daily_cap INTEGER := 200; -- Max points from comments per day
  v_today_points INTEGER;
BEGIN
  -- Check daily cap for earned points (not received points)
  IF p_action IN ('comment_created', 'reply_created') THEN
    SELECT COALESCE(SUM(points_awarded), 0) INTO v_today_points
    FROM public.comment_gamification_log
    WHERE profile_id = p_profile_id
      AND created_at >= CURRENT_DATE
      AND action IN ('comment_created', 'reply_created');
    
    IF v_today_points + v_points > v_daily_cap THEN
      v_points := GREATEST(0, v_daily_cap - v_today_points);
    END IF;
  END IF;
  
  IF v_points > 0 THEN
    INSERT INTO public.comment_gamification_log (profile_id, comment_id, action, points_awarded, metadata)
    VALUES (p_profile_id, p_comment_id, p_action, v_points, p_metadata);
  END IF;
  
  RETURN v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check and update comment streak
CREATE OR REPLACE FUNCTION public.check_and_update_comment_streak(p_profile_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_comment_date, current_comment_streak 
  INTO v_last_date, v_current_streak
  FROM public.user_comment_stats
  WHERE profile_id = p_profile_id;
  
  IF v_last_date IS NULL THEN
    INSERT INTO public.user_comment_stats (profile_id, current_comment_streak, longest_comment_streak, last_comment_date)
    VALUES (p_profile_id, 1, 1, CURRENT_DATE)
    ON CONFLICT (profile_id) DO UPDATE SET
      current_comment_streak = 1,
      longest_comment_streak = GREATEST(public.user_comment_stats.longest_comment_streak, 1),
      last_comment_date = CURRENT_DATE;
  ELSIF v_last_date = CURRENT_DATE - 1 THEN
    -- Consecutive day
    UPDATE public.user_comment_stats
    SET current_comment_streak = current_comment_streak + 1,
        longest_comment_streak = GREATEST(longest_comment_streak, current_comment_streak + 1),
        last_comment_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE profile_id = p_profile_id;
  ELSIF v_last_date < CURRENT_DATE - 1 THEN
    -- Streak broken
    UPDATE public.user_comment_stats
    SET current_comment_streak = 1,
        last_comment_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE profile_id = p_profile_id;
  END IF;
  -- If same day, do nothing
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process like received (award points to comment author)
CREATE OR REPLACE FUNCTION public.process_comment_like()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_today_likes INTEGER;
BEGIN
  -- Get comment author
  SELECT profile_id INTO v_author_id
  FROM public.comments WHERE id = NEW.comment_id;
  
  -- Increment like count
  UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  
  -- Update author stats
  UPDATE public.user_comment_stats
  SET total_likes_received = total_likes_received + 1,
      updated_at = NOW()
  WHERE profile_id = v_author_id;
  
  -- Check daily cap for author (50 points from likes per day)
  SELECT COALESCE(SUM(points_awarded), 0) INTO v_today_likes
  FROM public.comment_gamification_log
  WHERE profile_id = v_author_id
    AND created_at >= CURRENT_DATE
    AND action = 'like_received';
  
  -- Award points to author (cap at 50/day from likes)
  IF v_today_likes < 50 THEN
    PERFORM public.award_comment_points(v_author_id, 'like_received', NEW.comment_id, 1);
  END IF;
  
  -- Update liker stats
  UPDATE public.user_comment_stats
  SET total_likes_given = total_likes_given + 1,
      updated_at = NOW()
  WHERE profile_id = NEW.profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_process_comment_like
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.process_comment_like();

-- Function: Process unlike
CREATE OR REPLACE FUNCTION public.process_comment_unlike()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Get comment author
  SELECT profile_id INTO v_author_id
  FROM public.comments WHERE id = OLD.comment_id;
  
  -- Decrement like count
  UPDATE public.comments 
  SET like_count = GREATEST(0, like_count - 1) 
  WHERE id = OLD.comment_id;
  
  -- Update author stats
  UPDATE public.user_comment_stats
  SET total_likes_received = GREATEST(0, total_likes_received - 1),
      updated_at = NOW()
  WHERE profile_id = v_author_id;
  
  -- Update liker stats
  UPDATE public.user_comment_stats
  SET total_likes_given = GREATEST(0, total_likes_given - 1),
      updated_at = NOW()
  WHERE profile_id = OLD.profile_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_process_comment_unlike
  AFTER DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.process_comment_unlike();

-- ============================================================================
-- PROFILE GAMIFICATION COLUMNS (Must be before views that reference them)
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS experience_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_points_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for level-based queries (leaderboards, filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Comment thread with author info
CREATE OR REPLACE VIEW public.comment_threads AS
WITH RECURSIVE comment_tree AS (
  -- Base case: top-level comments
  SELECT 
    c.*,
    0 AS depth,
    ARRAY[c.id] AS path
  FROM public.comments c
  WHERE parent_comment_id IS NULL AND is_deleted = FALSE
  
  UNION ALL
  
  -- Recursive case: nested replies (limited depth)
  SELECT 
    c.*,
    ct.depth + 1,
    ct.path || c.id
  FROM public.comments c
  JOIN comment_tree ct ON c.parent_comment_id = ct.id
  WHERE c.is_deleted = FALSE AND ct.depth < 10
)
SELECT 
  ct.*,
  p.full_name AS author_name,
  p.avatar_url AS author_avatar,
  p.level AS author_level
FROM comment_tree ct
JOIN public.profiles p ON p.id = ct.profile_id;

-- View: Comment reaction counts
CREATE OR REPLACE VIEW public.comment_reaction_counts AS
SELECT 
  comment_id,
  reaction_type,
  COUNT(*) as count
FROM public.comment_reactions
GROUP BY comment_id, reaction_type;

-- View: User comment leaderboard (weekly)
CREATE OR REPLACE VIEW public.comment_leaderboard_weekly AS
SELECT 
  c.profile_id,
  p.full_name,
  p.avatar_url,
  p.level as profile_level,
  COUNT(*) as comments_count,
  COALESCE(SUM(c.like_count), 0) as likes_received,
  COALESCE(ucs.total_received_replies, 0) as replies_received
FROM public.comments c
JOIN public.profiles p ON p.id = c.profile_id
LEFT JOIN public.user_comment_stats ucs ON ucs.profile_id = c.profile_id
WHERE c.created_at >= date_trunc('week', NOW())
  AND c.is_deleted = FALSE
GROUP BY c.profile_id, p.full_name, p.avatar_url, p.level, ucs.total_received_replies
ORDER BY comments_count DESC
LIMIT 10;

-- View: User comment leaderboard (monthly)
CREATE OR REPLACE VIEW public.comment_leaderboard_monthly AS
SELECT 
  c.profile_id,
  p.full_name,
  p.avatar_url,
  p.level as profile_level,
  COUNT(*) as comments_count,
  COALESCE(SUM(c.like_count), 0) as likes_received,
  COALESCE(ucs.total_received_replies, 0) as replies_received
FROM public.comments c
JOIN public.profiles p ON p.id = c.profile_id
LEFT JOIN public.user_comment_stats ucs ON ucs.profile_id = c.profile_id
WHERE c.created_at >= date_trunc('month', NOW())
  AND c.is_deleted = FALSE
GROUP BY c.profile_id, p.full_name, p.avatar_url, p.level, ucs.total_received_replies
ORDER BY comments_count DESC
LIMIT 10;

-- View: User comment leaderboard (all time)
CREATE OR REPLACE VIEW public.comment_leaderboard_alltime AS
SELECT 
  c.profile_id,
  p.full_name,
  p.avatar_url,
  p.level as profile_level,
  COUNT(*) as comments_count,
  COALESCE(SUM(c.like_count), 0) as likes_received,
  COALESCE(ucs.total_received_replies, 0) as replies_received
FROM public.comments c
JOIN public.profiles p ON p.id = c.profile_id
LEFT JOIN public.user_comment_stats ucs ON ucs.profile_id = c.profile_id
WHERE c.is_deleted = FALSE
GROUP BY c.profile_id, p.full_name, p.avatar_url, p.level, ucs.total_received_replies
ORDER BY comments_count DESC
LIMIT 50;

-- ============================================================================
-- AUTO-UPDATE updated_at
-- ============================================================================

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_comment_stats_updated_at
  BEFORE UPDATE ON public.user_comment_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EXTEND BADGE SYSTEM: Add comment-related badges
-- ============================================================================

-- Extend badge_type enum with comment badges
ALTER TYPE public.badge_type ADD VALUE IF NOT EXISTS 'first_comment';
ALTER TYPE public.badge_type ADD VALUE IF NOT EXISTS 'active_commenter';
ALTER TYPE public.badge_type ADD VALUE IF NOT EXISTS 'helpful_responder';
ALTER TYPE public.badge_type ADD VALUE IF NOT EXISTS 'community_connector';
ALTER TYPE public.badge_type ADD VALUE IF NOT EXISTS 'comment_streak';
ALTER TYPE public.badge_type ADD VALUE IF NOT EXISTS 'liked_commenter';

-- Add comment badge check function
CREATE OR REPLACE FUNCTION public.check_and_award_comment_badges(p_profile_id UUID)
RETURNS TABLE(badge_name TEXT, badge_tier TEXT) AS $$
DECLARE
  v_stats public.user_comment_stats%ROWTYPE;
  v_badge TEXT;
  v_tier TEXT;
BEGIN
  SELECT * INTO v_stats FROM public.user_comment_stats WHERE profile_id = p_profile_id;
  
  IF NOT FOUND THEN RETURN; END IF;
  
  -- First Comment Badge
  IF v_stats.total_comments >= 1 THEN
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (p_profile_id, 'first_comment', 'bronze', 'เสียงแรก', 'คอมเมนต์ครั้งแรกในชุมชน', '💬', 'bg-blue-100 text-blue-700', 1)
    ON CONFLICT DO NOTHING
    RETURNING type::text, tier::text INTO v_badge, v_tier;
    IF v_badge IS NOT NULL THEN badge_name := v_badge; badge_tier := v_tier; RETURN NEXT; v_badge := NULL; END IF;
  END IF;
  
  -- Active Commenter Badges
  IF v_stats.total_comments >= 50 THEN
    v_tier := 'bronze';
    IF v_stats.total_comments >= 200 THEN v_tier := 'silver'; END IF;
    IF v_stats.total_comments >= 500 THEN v_tier := 'gold'; END IF;
    
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (p_profile_id, 'active_commenter', v_tier::badge_tier, 'นักพูดคุยขยัน', 'คอมเมนต์ครบ ' || v_stats.total_comments || ' ครั้ง', '💬', 'bg-indigo-100 text-indigo-700', v_stats.total_comments)
    ON CONFLICT (profile_id, type, tier) DO UPDATE SET 
      earned_value = v_stats.total_comments,
      name = 'นักพูดคุยขยัน',
      description = 'คอมเมนต์ครบ ' || v_stats.total_comments || ' ครั้ง'
    RETURNING type::text, tier::text INTO v_badge, v_tier;
    IF v_badge IS NOT NULL THEN badge_name := v_badge; badge_tier := v_tier; RETURN NEXT; v_badge := NULL; END IF;
  END IF;
  
  -- Helpful Responder (replies received)
  IF v_stats.total_received_replies >= 20 THEN
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (p_profile_id, 'helpful_responder', 'silver', 'ผู้ให้คำแนะนำ', 'มีคน reply คอมเมนต์ของคุณ 20 ครั้ง', '🤝', 'bg-emerald-100 text-emerald-700', v_stats.total_received_replies)
    ON CONFLICT DO NOTHING
    RETURNING type::text, tier::text INTO v_badge, v_tier;
    IF v_badge IS NOT NULL THEN badge_name := v_badge; badge_tier := v_tier; RETURN NEXT; v_badge := NULL; END IF;
  END IF;
  
  -- Community Connector (avg reply depth)
  IF v_stats.avg_reply_depth >= 3.0 THEN
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (p_profile_id, 'community_connector', 'gold', 'นักเชื่อมโยง', 'สร้างการสนทนาที่มีส่วนร่วมลึกซึ้ง', '🔗', 'bg-purple-100 text-purple-700', v_stats.avg_reply_depth::integer)
    ON CONFLICT DO NOTHING
    RETURNING type::text, tier::text INTO v_badge, v_tier;
    IF v_badge IS NOT NULL THEN badge_name := v_badge; badge_tier := v_tier; RETURN NEXT; v_badge := NULL; END IF;
  END IF;
  
  -- Streak Master
  IF v_stats.current_comment_streak >= 7 THEN
    v_tier := 'silver';
    IF v_stats.current_comment_streak >= 30 THEN v_tier := 'gold'; END IF;
    IF v_stats.current_comment_streak >= 100 THEN v_tier := 'platinum'; END IF;
    
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (p_profile_id, 'comment_streak', v_tier::badge_tier, 'ไม่มีวันหยุด', 'คอมเมนต์ต่อเนื่อง ' || v_stats.current_comment_streak || ' วัน', '🔥', 'bg-orange-100 text-orange-700', v_stats.current_comment_streak)
    ON CONFLICT (profile_id, type, tier) DO UPDATE SET
      earned_value = v_stats.current_comment_streak,
      name = 'ไม่มีวันหยุด',
      description = 'คอมเมนต์ต่อเนื่อง ' || v_stats.current_comment_streak || ' วัน'
    RETURNING type::text, tier::text INTO v_badge, v_tier;
    IF v_badge IS NOT NULL THEN badge_name := v_badge; badge_tier := v_tier; RETURN NEXT; v_badge := NULL; END IF;
  END IF;
  
  -- Liked Commenter
  IF v_stats.total_likes_received >= 100 THEN
    v_tier := 'bronze';
    IF v_stats.total_likes_received >= 500 THEN v_tier := 'silver'; END IF;
    IF v_stats.total_likes_received >= 2000 THEN v_tier := 'gold'; END IF;
    
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (p_profile_id, 'liked_commenter', v_tier::badge_tier, 'คนดังในชุมชน', 'ได้รับ ' || v_stats.total_likes_received || ' likes จากคอมเมนต์', '❤️', 'bg-pink-100 text-pink-700', v_stats.total_likes_received)
    ON CONFLICT (profile_id, type, tier) DO UPDATE SET
      earned_value = v_stats.total_likes_received,
      name = 'คนดังในชุมชน',
      description = 'ได้รับ ' || v_stats.total_likes_received || ' likes จากคอมเมนต์'
    RETURNING type::text, tier::text INTO v_badge, v_tier;
    IF v_badge IS NOT NULL THEN badge_name := v_badge; badge_tier := v_tier; RETURN NEXT; v_badge := NULL; END IF;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-check comment badges when stats change
CREATE OR REPLACE FUNCTION public.trigger_check_comment_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.check_and_award_comment_badges(NEW.profile_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_comment_badges
  AFTER UPDATE ON public.user_comment_stats
  FOR EACH ROW
  WHEN (OLD.total_comments != NEW.total_comments OR
        OLD.total_likes_received != NEW.total_likes_received OR
        OLD.current_comment_streak != NEW.current_comment_streak OR
        OLD.total_received_replies != NEW.total_received_replies)
  EXECUTE FUNCTION public.trigger_check_comment_badges();

-- ============================================================================
-- PROFILE GAMIFICATION FUNCTIONS & BACKFILL
-- ============================================================================

-- Function: Calculate level from points
CREATE OR REPLACE FUNCTION calculate_level_from_points(points INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE
    WHEN points >= 10000 THEN 10
    WHEN points >= 7500  THEN 9
    WHEN points >= 5500  THEN 8
    WHEN points >= 4000  THEN 7
    WHEN points >= 2800  THEN 6
    WHEN points >= 1800  THEN 5
    WHEN points >= 1000  THEN 4
    WHEN points >= 500   THEN 3
    WHEN points >= 200   THEN 2
    ELSE 1
  END;
$$;

-- Function: Update profile gamification (trigger)
CREATE OR REPLACE FUNCTION update_profile_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_donation_points INTEGER;
  total_comment_points INTEGER;
  new_total_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Calculate total points from donations
  SELECT COALESCE(SUM(points_awarded), 0)
  INTO total_donation_points
  FROM public.donations
  WHERE donor_id = NEW.id
    AND payment_status = 'succeeded';

  -- Calculate total points from comments
  SELECT COALESCE(SUM(points_awarded), 0)
  INTO total_comment_points
  FROM public.comment_gamification_log
  WHERE profile_id = NEW.id;

  -- Calculate new total
  new_total_points := total_donation_points + total_comment_points;
  new_level := calculate_level_from_points(new_total_points);

  -- Update profile
  NEW.total_points := new_total_points;
  NEW.experience_points := new_total_points;
  NEW.level := new_level;
  NEW.last_points_update := NOW();

  RETURN NEW;
END;
$$;

-- Trigger: Auto-update gamification on profile update
DROP TRIGGER IF EXISTS update_profile_gamification_on_change ON public.profiles;

CREATE TRIGGER update_profile_gamification_on_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.total_points IS DISTINCT FROM NEW.total_points OR OLD.last_points_update IS NULL)
  EXECUTE FUNCTION update_profile_gamification();

-- Function: Sync profile gamification (manual call)
CREATE OR REPLACE FUNCTION sync_profile_gamification(p_profile_id UUID)
RETURNS TABLE (
  profile_id UUID,
  old_level INTEGER,
  new_level INTEGER,
  old_points INTEGER,
  new_points INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_level INTEGER;
  v_old_points INTEGER;
  v_new_total_points INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current values
  SELECT level, total_points
  INTO v_old_level, v_old_points
  FROM public.profiles
  WHERE id = p_profile_id;

  -- Calculate new points
  SELECT COALESCE(SUM(d.points_awarded), 0) + COALESCE(SUM(c.points_awarded), 0)
  INTO v_new_total_points
  FROM public.profiles p
  LEFT JOIN public.donations d ON d.donor_id = p.id AND d.payment_status = 'succeeded'
  LEFT JOIN public.comment_gamification_log c ON c.profile_id = p.id
  WHERE p.id = p_profile_id;

  v_new_level := calculate_level_from_points(v_new_total_points);

  -- Update profile
  UPDATE public.profiles
  SET 
    total_points = v_new_total_points,
    experience_points = v_new_total_points,
    level = v_new_level,
    last_points_update = NOW()
  WHERE id = p_profile_id;

  RETURN QUERY SELECT 
    p_profile_id,
    v_old_level,
    v_new_level,
    v_old_points,
    v_new_total_points;
END;
$$;

-- Backfill: Sync gamification for all existing profiles
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id FROM public.profiles LOOP
    PERFORM sync_profile_gamification(profile_record.id);
  END LOOP;
END;
$$;

-- ============================================================================
-- UPDATE DONATION VIEWS TO USE ACTUAL LEVEL COLUMN
-- ============================================================================

-- Must drop views first because column names changed (can't use CREATE OR REPLACE)
DROP VIEW IF EXISTS public.donation_leaderboard;

-- Update donation_leaderboard view
CREATE VIEW public.donation_leaderboard AS
SELECT 
  d.donor_id,
  p.full_name as donor_name,
  p.avatar_url as donor_avatar,
  p.level,
  COUNT(*) as donation_count,
  SUM(d.amount) as total_amount,
  MAX(d.created_at) as last_donation_at,
  BOOL_OR(d.show_on_leaderboard) as is_visible
FROM public.donations d
JOIN public.profiles p ON p.id = d.donor_id
WHERE d.payment_status = 'succeeded'
GROUP BY d.donor_id, p.full_name, p.avatar_url, p.level
ORDER BY total_amount DESC
LIMIT 50;

-- ============================================================================
-- COMMENTS ON NEW COLUMNS
-- ============================================================================

COMMENT ON COLUMN public.profiles.level IS 'User level calculated from total_points (1-10)';
COMMENT ON COLUMN public.profiles.total_points IS 'Total gamification points from all sources';
COMMENT ON COLUMN public.profiles.experience_points IS 'Experience points for potential XP-based leveling system';
COMMENT ON COLUMN public.profiles.last_points_update IS 'Last time gamification data was synced';

-- ============================================================================
-- UTILITY RPC FUNCTIONS
-- ============================================================================

-- Function: Get comment depth (how many levels deep in the thread)
CREATE OR REPLACE FUNCTION public.get_comment_depth(p_comment_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_depth INTEGER := 0;
  v_current_id UUID := p_comment_id;
  v_parent_id UUID;
BEGIN
  WHILE v_current_id IS NOT NULL LOOP
    SELECT parent_comment_id INTO v_parent_id
    FROM public.comments
    WHERE id = v_current_id;
    
    IF v_parent_id IS NULL THEN
      EXIT;
    END IF;
    
    v_depth := v_depth + 1;
    v_current_id := v_parent_id;
  END LOOP;
  
  RETURN v_depth;
END;
$$;

-- Function: Get full comment thread for a pet post
CREATE OR REPLACE FUNCTION public.get_comment_thread(
  p_pet_post_id UUID,
  p_max_depth INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  pet_post_id UUID,
  profile_id UUID,
  parent_comment_id UUID,
  content TEXT,
  is_edited BOOLEAN,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_reason TEXT,
  reply_count INTEGER,
  like_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  depth INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments
    SELECT 
      c.*,
      0 as depth
    FROM public.comments c
    WHERE c.pet_post_id = p_pet_post_id
      AND c.parent_comment_id IS NULL
      AND NOT c.is_deleted
    
    UNION ALL
    
    -- Recursive case: replies
    SELECT 
      c.*,
      ct.depth + 1
    FROM public.comments c
    INNER JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE c.pet_post_id = p_pet_post_id
      AND NOT c.is_deleted
      AND ct.depth < p_max_depth
  )
  SELECT 
    ct.id,
    ct.pet_post_id,
    ct.profile_id,
    ct.parent_comment_id,
    ct.content,
    ct.is_edited,
    ct.edited_at,
    ct.is_deleted,
    ct.deleted_at,
    ct.deleted_reason,
    ct.reply_count,
    ct.like_count,
    ct.created_at,
    ct.updated_at,
    ct.depth
  FROM comment_tree ct
  ORDER BY ct.depth, ct.created_at;
END;
$$;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Badge types added via this migration:
-- 'first_comment' - First comment in community
-- 'active_commenter' - 50/200/500 comments (bronze/silver/gold)
-- 'helpful_responder' - 20 replies received
-- 'community_connector' - Average reply depth >= 3
-- 'comment_streak' - 7/30/100 days streak (silver/gold/platinum)
-- 'liked_commenter' - 100/500/2000 likes received
