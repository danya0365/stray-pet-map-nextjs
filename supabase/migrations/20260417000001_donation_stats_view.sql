-- ============================================================================
-- Donation Stats View Migration
-- Created: 17 Apr 2026
-- Description: Views and functions for donation statistics (RoadMap, Leaderboard)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: roadmap_stats (for RoadMap page - separated from donation_stats)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.roadmap_stats;

CREATE OR REPLACE VIEW public.roadmap_stats AS
SELECT
  COALESCE(SUM(amount), 0) AS total_raised,
  COUNT(DISTINCT donor_id) AS unique_donors
FROM public.donations
WHERE payment_status = 'completed';

-- ----------------------------------------------------------------------------
-- View: donation_leaderboard (for Leaderboard page)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.donation_leaderboard AS
WITH donor_totals AS (
  SELECT
    donor_id,
    donor_name,
    SUM(amount) AS total_amount,
    COUNT(*) AS donation_count,
    MAX(created_at) AS last_donation_at
  FROM public.donations
  WHERE payment_status = 'completed'
    AND show_on_leaderboard = TRUE
  GROUP BY donor_id, donor_name
)
SELECT
  donor_id,
  donor_name,
  total_amount,
  donation_count,
  last_donation_at,
  RANK() OVER (ORDER BY total_amount DESC) AS rank
FROM donor_totals
ORDER BY total_amount DESC;

-- ----------------------------------------------------------------------------
-- Function: Get user's donation stats
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_donation_stats(user_uuid UUID)
RETURNS TABLE (
  total_donated NUMERIC,
  donation_count BIGINT,
  total_points INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(SUM(amount), 0) AS total_donated,
    COUNT(*) AS donation_count,
    COALESCE(SUM(points_awarded), 0) AS total_points
  FROM public.donations
  WHERE donor_id = user_uuid
    AND payment_status = 'completed';
$$;

-- ----------------------------------------------------------------------------
-- RLS Policy for views
-- ----------------------------------------------------------------------------
-- Allow everyone to read donation_stats
CREATE POLICY "View donation stats"
  ON public.donations FOR SELECT
  USING (payment_status = 'completed');

-- ----------------------------------------------------------------------------
-- Grant permissions
-- ----------------------------------------------------------------------------
GRANT SELECT ON public.roadmap_stats TO anon, authenticated;
GRANT SELECT ON public.donation_stats TO anon, authenticated;
GRANT SELECT ON public.donation_leaderboard TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_donation_stats(UUID) TO authenticated;
