-- ============================================================================
-- Donation System Migration
-- Created: 17 Apr 2026
-- Description: Dual-mode donation system (pet-specific + general fund) with guest support
-- Gamification integration for "ฮีโร่ช่วยน้อง"
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: donations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Donor info (nullable for guest)
  donor_id UUID REFERENCES public.profiles(id),  -- NULL = guest donation
  donor_name TEXT NOT NULL DEFAULT 'ผู้ใจดี',    -- guest name or override
  donor_email TEXT,                              -- for receipt
  is_anonymous BOOLEAN DEFAULT FALSE,            -- hide from leaderboard
  
  -- Donation target (dual mode)
  target_type TEXT NOT NULL CHECK (target_type IN ('pet', 'fund')),
  pet_post_id UUID REFERENCES public.pet_posts(id),  -- NULL = general fund
  
  -- Amount & Payment
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'THB',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe_promptpay', 'stripe_card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  
  -- Message & Recognition
  message TEXT,
  show_on_leaderboard BOOLEAN DEFAULT TRUE,
  
  -- Gamification tracking
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id) WHERE donor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_pet_post_id ON public.donations(pet_post_id) WHERE pet_post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_target_type ON public.donations(target_type);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON public.donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_show_leaderboard ON public.donations(show_on_leaderboard) WHERE show_on_leaderboard = TRUE AND payment_status = 'completed';
CREATE INDEX IF NOT EXISTS idx_donations_completed ON public.donations(payment_status, created_at) WHERE payment_status = 'completed';

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- View completed donations (for leaderboard)
CREATE POLICY "View completed donations"
  ON public.donations FOR SELECT
  USING (payment_status = 'completed');

-- Donors can view their own pending donations
CREATE POLICY "Donors view own donations"
  ON public.donations FOR SELECT
  USING (donor_id = public.get_active_profile_id());

-- Service role can manage all
CREATE POLICY "Service role manages donations"
  ON public.donations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Table: pet_post_funding_goals (for pet-specific fundraising)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pet_post_funding_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_post_id UUID NOT NULL REFERENCES public.pet_posts(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('medical', 'food', 'shelter', 'transport', 'other')),
  target_amount NUMERIC(10,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  description TEXT,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_funding_goals_pet_post_id ON public.pet_post_funding_goals(pet_post_id);
CREATE INDEX IF NOT EXISTS idx_funding_goals_active ON public.pet_post_funding_goals(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.pet_post_funding_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "View funding goals"
  ON public.pet_post_funding_goals FOR SELECT
  USING (true);

CREATE POLICY "Admins manage funding goals"
  ON public.pet_post_funding_goals FOR ALL
  USING (public.get_active_profile_role() = 'admin'::public.profile_role)
  WITH CHECK (public.get_active_profile_role() = 'admin'::public.profile_role);

-- ----------------------------------------------------------------------------
-- Function: Auto-update funding goal amount when donation completes
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_funding_goal_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' 
     AND OLD.payment_status != 'completed' 
     AND NEW.target_type = 'pet' 
     AND NEW.pet_post_id IS NOT NULL THEN
    
    UPDATE public.pet_post_funding_goals
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW(),
        is_active = CASE 
          WHEN (current_amount + NEW.amount) >= target_amount THEN FALSE 
          ELSE is_active 
        END
    WHERE pet_post_id = NEW.pet_post_id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_funding_goal
  AFTER UPDATE OF payment_status ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION update_funding_goal_amount();

-- ----------------------------------------------------------------------------
-- View: donation_leaderboard_weekly
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.donation_leaderboard_weekly AS
SELECT
  COALESCE(d.donor_id, '00000000-0000-0000-0000-000000000000'::UUID) as donor_id,
  MAX(COALESCE(d.donor_name, p.full_name, 'ผู้ใจดี')) as donor_name,
  MAX(p.avatar_url) as avatar_url,
  1 as level, -- default level (gamification to be added in Phase 2)
  SUM(d.amount) as total_amount,
  COUNT(*) as donation_count,
  MAX(d.created_at) as last_donation_at
FROM public.donations d
LEFT JOIN public.profiles p ON p.id = d.donor_id
WHERE d.payment_status = 'completed'
  AND d.show_on_leaderboard = TRUE
  AND d.is_anonymous = FALSE
  AND d.created_at >= date_trunc('week', NOW())
GROUP BY COALESCE(d.donor_id, '00000000-0000-0000-0000-000000000000'::UUID)
ORDER BY total_amount DESC;

-- ----------------------------------------------------------------------------
-- View: donation_leaderboard_alltime
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.donation_leaderboard_alltime AS
SELECT
  COALESCE(d.donor_id, '00000000-0000-0000-0000-000000000000'::UUID) as donor_id,
  MAX(COALESCE(d.donor_name, p.full_name, 'ผู้ใจดี')) as donor_name,
  MAX(p.avatar_url) as avatar_url,
  1 as level, -- default level (gamification to be added in Phase 2)
  SUM(d.amount) as total_amount,
  COUNT(*) as donation_count
FROM public.donations d
LEFT JOIN public.profiles p ON p.id = d.donor_id
WHERE d.payment_status = 'completed'
  AND d.show_on_leaderboard = TRUE
  AND d.is_anonymous = FALSE
GROUP BY COALESCE(d.donor_id, '00000000-0000-0000-0000-000000000000'::UUID)
ORDER BY total_amount DESC
LIMIT 50;

-- ----------------------------------------------------------------------------
-- View: donation_stats (for dashboard)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.donation_stats AS
SELECT
  COUNT(*) as total_donations,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as monthly_donations,
  COUNT(*) FILTER (WHERE created_at >= date_trunc('week', NOW())) as weekly_donations,
  COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0) as total_raised,
  COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed' AND created_at >= date_trunc('month', NOW())), 0) as monthly_raised,
  COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed' AND created_at >= date_trunc('week', NOW())), 0) as weekly_raised,
  COUNT(DISTINCT donor_id) FILTER (WHERE payment_status = 'completed') as unique_donors
FROM public.donations;

-- ----------------------------------------------------------------------------
-- Auto-update updated_at
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funding_goals_updated_at
  BEFORE UPDATE ON public.pet_post_funding_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
