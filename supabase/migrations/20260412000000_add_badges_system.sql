-- ============================================================
-- BADGES SYSTEM
-- ตราสัญลักษณ์สำหรับผู้ใช้ (Gamification)
-- ============================================================

-- Badge Tier Enum
CREATE TYPE public.badge_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Badge Type Enum
CREATE TYPE public.badge_type AS ENUM (
  'first_post',           -- สร้างโพสต์แรก
  'successful_adoption',  -- ช่วยหาบ้านให้สัตว์สำเร็จ
  'pet_finder',          -- ช่วยตามหาสัตว์หายเจอเจ้าของ
  'rescue_hero',         -- ช่วยเหลือสัตว์จรจัด (community cat)
  'active_helper',       -- สร้างโพสต์ครบ 5 โพสต์
  'super_helper',        -- สร้างโพสต์ครบ 20 โพสต์
  'quick_responder',     -- ตอบรับคำขอรับเลี้ยงภายใน 24 ชม.
  'verified_rescuer'     -- ยืนยันตัวตนและมีประวัติช่วยเหลือ
);

-- Profile Badges Table
CREATE TABLE IF NOT EXISTS public.profile_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.badge_type NOT NULL,
  tier public.badge_tier NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  earned_value INTEGER,  -- ค่าที่ทำให้ได้รับ badge (เช่น จำนวนโพสต์)
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- ผู้ใช้หนึ่งคนมี badge หนึ่งประเภทได้ tier เดียว
  UNIQUE(profile_id, type, tier)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_badges_profile_id 
  ON public.profile_badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_badges_type 
  ON public.profile_badges(type);
CREATE INDEX IF NOT EXISTS idx_profile_badges_awarded_at 
  ON public.profile_badges(awarded_at DESC);

-- ============================================================
-- VIEWS FOR LEADERBOARD & STATS
-- ============================================================

-- View: นับจำนวน badge ต่อ profile
CREATE OR REPLACE VIEW public.profile_badge_counts AS
SELECT 
  pb.profile_id,
  p.full_name AS display_name,
  p.avatar_url,
  COUNT(pb.id) AS badge_count,
  MAX(pb.awarded_at) AS last_awarded_at
FROM public.profile_badges pb
JOIN public.profiles p ON p.id = pb.profile_id
GROUP BY pb.profile_id, p.full_name, p.avatar_url;

-- View: สถิติโพสต์ต่อ profile (สำหรับคำนวณ progress)
CREATE OR REPLACE VIEW public.profile_post_stats AS
SELECT 
  pp.profile_id,
  COUNT(*) AS total_posts,
  COUNT(*) FILTER (WHERE pp.outcome = 'rehomed') AS successful_adoptions,
  COUNT(*) FILTER (WHERE pp.outcome = 'owner_found') AS found_owners,
  COUNT(*) FILTER (WHERE pp.purpose = 'community_cat') AS community_cats,
  COUNT(*) FILTER (WHERE pp.purpose = 'lost_pet') AS lost_pet_posts,
  COUNT(*) FILTER (WHERE pp.purpose = 'rehome_pet') AS rehome_posts
FROM public.pet_posts pp
WHERE pp.is_active = true
GROUP BY pp.profile_id;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;

-- ทุกคนสามารถดู badges ได้
CREATE POLICY "Badges are viewable by everyone" 
  ON public.profile_badges 
  FOR SELECT 
  USING (true);

-- แอดมินหรือระบบเท่านั้นที่สามารถเพิ่ม/ลบ badge ได้
CREATE POLICY "Only system can insert badges" 
  ON public.profile_badges 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profile_roles pr ON pr.profile_id = p.id
      WHERE p.id = auth.uid() AND pr.role = 'admin'
    )
    OR auth.uid() IS NULL  -- สำหรับ service role / cron jobs
  );

-- ============================================================
-- FUNCTION: ตรวจสอบและมอบ badge อัตโนมัติ
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_and_award_badges(target_profile_id UUID)
RETURNS TABLE(awarded_badge TEXT, tier TEXT) AS $$
DECLARE
  post_count INTEGER;
  adoption_count INTEGER;
  finder_count INTEGER;
  rescue_count INTEGER;
  new_badge TEXT;
  new_tier TEXT;
BEGIN
  -- ดึงสถิติ
  SELECT 
    total_posts,
    successful_adoptions,
    found_owners,
    community_cats
  INTO post_count, adoption_count, finder_count, rescue_count
  FROM public.profile_post_stats
  WHERE profile_id = target_profile_id;
  
  -- First Post Badge (Bronze)
  IF post_count >= 1 THEN
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (
      target_profile_id, 'first_post', 'bronze', 
      'นักช่วยเหลือมือใหม่', 'สร้างโพสต์ช่วยเหลือสัตว์ครั้งแรก',
      '🌟', 'bg-amber-100 text-amber-700', 1
    )
    ON CONFLICT DO NOTHING
    RETURNING 'first_post', 'bronze' INTO new_badge, new_tier;
    
    IF new_badge IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END IF;
  
  -- Active Helper Badge (Silver - 5 posts)
  IF post_count >= 5 THEN
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (
      target_profile_id, 'active_helper', 'silver', 
      'นักช่วยเหลือขยัน', 'สร้างโพสต์ช่วยเหลือครบ 5 โพสต์',
      '⚡', 'bg-orange-100 text-orange-700', post_count
    )
    ON CONFLICT DO NOTHING
    RETURNING 'active_helper', 'silver' INTO new_badge, new_tier;
    
    IF new_badge IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END IF;
  
  -- Super Helper Badge (Gold - 20 posts)
  IF post_count >= 20 THEN
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (
      target_profile_id, 'super_helper', 'gold', 
      'ซูเปอร์ฮีโร่สัตว์', 'สร้างโพสต์ช่วยเหลือครบ 20 โพสต์',
      '🦸‍♂️', 'bg-red-100 text-red-700', post_count
    )
    ON CONFLICT DO NOTHING
    RETURNING 'super_helper', 'gold' INTO new_badge, new_tier;
    
    IF new_badge IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END IF;
  
  -- Successful Adoption Badges
  IF adoption_count >= 1 THEN
    new_tier := 'bronze';
    IF adoption_count >= 3 THEN new_tier := 'silver'; END IF;
    IF adoption_count >= 10 THEN new_tier := 'gold'; END IF;
    IF adoption_count >= 30 THEN new_tier := 'platinum'; END IF;
    
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (
      target_profile_id, 'successful_adoption', new_tier::badge_tier, 
      'ผู้ให้บ้านที่อบอุ่น', 'ช่วยหาบ้านใหม่ให้สัตว์จรจัดสำเร็จ ' || adoption_count || ' ตัว',
      '🏠', 'bg-emerald-100 text-emerald-700', adoption_count
    )
    ON CONFLICT (profile_id, type, tier) DO UPDATE SET
      earned_value = EXCLUDED.earned_value,
      name = EXCLUDED.name
    RETURNING 'successful_adoption', new_tier INTO new_badge, new_tier;
    
    IF new_badge IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END IF;
  
  -- Pet Finder Badges
  IF finder_count >= 1 THEN
    new_tier := 'bronze';
    IF finder_count >= 5 THEN new_tier := 'silver'; END IF;
    IF finder_count >= 15 THEN new_tier := 'gold'; END IF;
    
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (
      target_profile_id, 'pet_finder', new_tier::badge_tier, 
      'นักสืบสัตว์เลี้ยง', 'ช่วยตามหาสัตว์หายและเจอเจ้าของ ' || finder_count || ' ตัว',
      '🔍', 'bg-blue-100 text-blue-700', finder_count
    )
    ON CONFLICT (profile_id, type, tier) DO UPDATE SET
      earned_value = EXCLUDED.earned_value,
      name = EXCLUDED.name
    RETURNING 'pet_finder', new_tier INTO new_badge, new_tier;
    
    IF new_badge IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END IF;
  
  -- Rescue Hero Badges (Community Cats)
  IF rescue_count >= 3 THEN
    new_tier := 'bronze';
    IF rescue_count >= 10 THEN new_tier := 'silver'; END IF;
    IF rescue_count >= 25 THEN new_tier := 'gold'; END IF;
    
    INSERT INTO public.profile_badges (profile_id, type, tier, name, description, icon, color, earned_value)
    VALUES (
      target_profile_id, 'rescue_hero', new_tier::badge_tier, 
      'ฮีโร่แมวจร', 'ช่วยเหลือแมวจรจัดในชุมชน ' || rescue_count || ' ตัว',
      '🦸', 'bg-purple-100 text-purple-700', rescue_count
    )
    ON CONFLICT (profile_id, type, tier) DO UPDATE SET
      earned_value = EXCLUDED.earned_value,
      name = EXCLUDED.name
    RETURNING 'rescue_hero', new_tier INTO new_badge, new_tier;
    
    IF new_badge IS NOT NULL THEN
      RETURN NEXT;
    END IF;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: อัปเดต badge อัตโนมัติเมื่อโพสต์มีการเปลี่ยนแปลง
-- ============================================================

CREATE OR REPLACE FUNCTION public.trigger_check_badges_on_post_change()
RETURNS TRIGGER AS $$
BEGIN
  -- ตรวจสอบ badges สำหรับเจ้าของโพสต์
  IF TG_OP = 'DELETE' THEN
    PERFORM public.check_and_award_badges(OLD.profile_id);
    RETURN OLD;
  ELSE
    PERFORM public.check_and_award_badges(NEW.profile_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- สร้าง trigger (ถ้ายังไม่มี)
DROP TRIGGER IF EXISTS check_badges_on_post_change ON public.pet_posts;
CREATE TRIGGER check_badges_on_post_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pet_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_check_badges_on_post_change();
