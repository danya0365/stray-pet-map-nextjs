-- Activity Feed Materialized View
-- Replaces JS-level merge of pet_posts + comments with a single indexed DB query.
-- Stores only the 1,000 most recent activity items (bounded count).
-- Refresh: triggers auto-refresh on pet_posts/comments changes.
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.activity_feed_items AS
SELECT * FROM (
  SELECT
    'post_' || pp.id AS id,
    'new_post' AS type,
    pp.profile_id AS actor_id,
    profiles.full_name AS actor_name,
    profiles.avatar_url AS actor_avatar,
    COALESCE(profiles.level, 1) AS actor_level,
    pp.id AS post_id,
    pp.title AS post_title,
    pp.thumbnail_url AS post_thumbnail,
    pp.purpose::text AS post_purpose,
    pp.status::text AS post_status,
    pp.outcome::text AS post_outcome,
    NULL::uuid AS comment_id,
    NULL::text AS comment_content,
    NULL::uuid AS parent_comment_id,
    pp.updated_at AS occurred_at
  FROM public.pet_posts pp
  JOIN public.profiles ON profiles.id = pp.profile_id
  WHERE pp.is_active = true AND pp.is_archived = false

  UNION ALL

  SELECT
    'comment_' || c.id AS id,
    CASE WHEN c.parent_comment_id IS NOT NULL THEN 'comment_reply' ELSE 'new_comment' END AS type,
    c.profile_id AS actor_id,
    profiles.full_name AS actor_name,
    profiles.avatar_url AS actor_avatar,
    COALESCE(profiles.level, 1) AS actor_level,
    c.pet_post_id AS post_id,
    NULL AS post_title,
    NULL AS post_thumbnail,
    NULL AS post_purpose,
    NULL AS post_status,
    NULL AS post_outcome,
    c.id AS comment_id,
    c.content AS comment_content,
    c.parent_comment_id,
    c.created_at AS occurred_at
  FROM public.comments c
  JOIN public.profiles ON profiles.id = c.profile_id
  WHERE c.is_deleted = false
) combined
ORDER BY occurred_at DESC
LIMIT 1000;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Required for REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_feed_id ON public.activity_feed_items (id);

-- Feed query: sort by occurred_at DESC, filter by type
CREATE INDEX IF NOT EXISTS idx_activity_feed_occurred_at ON public.activity_feed_items (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed_items (type);

-- ============================================================================
-- REFRESH FUNCTION (can be called from app or pg_cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.refresh_activity_feed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.activity_feed_items;
END;
$$;

-- ============================================================================
-- TRIGGERS (auto-refresh on key events — lightweight, debounced by Supabase)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_refresh_activity_feed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.refresh_activity_feed();
  RETURN NULL;
END;
$$;

-- Refresh on new/updated posts
DROP TRIGGER IF EXISTS refresh_feed_on_post_change ON public.pet_posts;
CREATE TRIGGER refresh_feed_on_post_change
  AFTER INSERT OR UPDATE ON public.pet_posts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_refresh_activity_feed();

-- Refresh on new/updated comments
DROP TRIGGER IF EXISTS refresh_feed_on_comment_change ON public.comments;
CREATE TRIGGER refresh_feed_on_comment_change
  AFTER INSERT OR UPDATE ON public.comments
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_refresh_activity_feed();
