-- Stray Pet Map Domain Tables
-- Created: 2026-02-12
-- Author: Marosdee Uma
-- Description: Pet types, Pet posts, Images, Adoption requests, Favorites, Reports
--              All business tables FK to profiles.id (not auth.users.id)

-- ============================================================================
-- ENUMS
-- ============================================================================
CREATE TYPE public.pet_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE public.pet_post_status AS ENUM ('available', 'pending', 'adopted', 'missing');
CREATE TYPE public.adoption_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE public.report_reason AS ENUM ('spam', 'fake_info', 'inappropriate', 'animal_abuse', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- ============================================================================
-- 1. PET_TYPES (ชนิดสัตว์: หมา, แมว, กระต่าย ฯลฯ)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pet_types (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '🐾',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_types_slug ON public.pet_types(slug);
CREATE INDEX IF NOT EXISTS idx_pet_types_is_active ON public.pet_types(is_active);

-- ============================================================================
-- 2. PET_POSTS (โพสต์สัตว์จร — ตำแหน่ง, รายละเอียด, สถานะ)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pet_posts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pet_type_id UUID REFERENCES public.pet_types(id) ON DELETE SET NULL,

  -- ข้อมูลสัตว์
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  breed TEXT DEFAULT '',
  color TEXT DEFAULT '',
  gender public.pet_gender NOT NULL DEFAULT 'unknown',
  estimated_age TEXT DEFAULT '',
  is_vaccinated BOOLEAN DEFAULT NULL,
  is_neutered BOOLEAN DEFAULT NULL,

  -- ตำแหน่ง
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT DEFAULT '',
  province TEXT DEFAULT '',

  -- สถานะ
  status public.pet_post_status NOT NULL DEFAULT 'available',

  -- Media
  thumbnail_url TEXT DEFAULT '',

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_posts_profile_id ON public.pet_posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_pet_posts_pet_type_id ON public.pet_posts(pet_type_id);
CREATE INDEX IF NOT EXISTS idx_pet_posts_status ON public.pet_posts(status);
CREATE INDEX IF NOT EXISTS idx_pet_posts_province ON public.pet_posts(province);
CREATE INDEX IF NOT EXISTS idx_pet_posts_is_active ON public.pet_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_pet_posts_location ON public.pet_posts(latitude, longitude);

-- ============================================================================
-- 3. PET_IMAGES (รูปภาพของแต่ละโพสต์)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pet_images (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_post_id UUID REFERENCES public.pet_posts(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_images_pet_post_id ON public.pet_images(pet_post_id);

-- ============================================================================
-- 4. ADOPTION_REQUESTS (คำขอรับเลี้ยง)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.adoption_requests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pet_post_id UUID REFERENCES public.pet_posts(id) ON DELETE CASCADE NOT NULL,
  requester_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  message TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_line_id TEXT DEFAULT '',

  status public.adoption_request_status NOT NULL DEFAULT 'pending',

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adoption_requests_pet_post ON public.adoption_requests(pet_post_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_requester ON public.adoption_requests(requester_profile_id);
CREATE INDEX IF NOT EXISTS idx_adoption_requests_status ON public.adoption_requests(status);

-- ============================================================================
-- 5. FAVORITES (บุ๊คมาร์คโพสต์ที่สนใจ)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pet_post_id UUID REFERENCES public.pet_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, pet_post_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_profile_id ON public.favorites(profile_id);
CREATE INDEX IF NOT EXISTS idx_favorites_pet_post_id ON public.favorites(pet_post_id);

-- ============================================================================
-- 6. REPORTS (แจ้งรายงานโพสต์ที่ไม่เหมาะสม)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  reporter_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pet_post_id UUID REFERENCES public.pet_posts(id) ON DELETE CASCADE NOT NULL,

  reason public.report_reason NOT NULL DEFAULT 'other',
  description TEXT DEFAULT '',

  status public.report_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_pet_post ON public.reports(pet_post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ============================================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================================
CREATE TRIGGER update_pet_types_updated_at
  BEFORE UPDATE ON public.pet_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_posts_updated_at
  BEFORE UPDATE ON public.pet_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoption_requests_updated_at
  BEFORE UPDATE ON public.adoption_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS: Enable Row Level Security
-- ============================================================================
ALTER TABLE public.pet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Pet types: public read, admin write
CREATE POLICY "Pet types are viewable by everyone"
  ON public.pet_types FOR SELECT USING (true);

CREATE POLICY "Only admins can manage pet types"
  ON public.pet_types FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Pet posts: public read, owner create/update, admin manages all
CREATE POLICY "Pet posts are viewable by everyone"
  ON public.pet_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create pet posts"
  ON public.pet_posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND profile_id = public.get_active_profile_id()
  );

CREATE POLICY "Owners can update their own pet posts"
  ON public.pet_posts FOR UPDATE
  USING (profile_id = public.get_active_profile_id())
  WITH CHECK (profile_id = public.get_active_profile_id());

CREATE POLICY "Owners can delete their own pet posts"
  ON public.pet_posts FOR DELETE
  USING (profile_id = public.get_active_profile_id());

CREATE POLICY "Admins can manage all pet posts"
  ON public.pet_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Pet images: public read, post owner manages
CREATE POLICY "Pet images are viewable by everyone"
  ON public.pet_images FOR SELECT USING (true);

CREATE POLICY "Post owners can manage their pet images"
  ON public.pet_images FOR ALL
  USING (
    pet_post_id IN (
      SELECT id FROM public.pet_posts WHERE profile_id = public.get_active_profile_id()
    )
  )
  WITH CHECK (
    pet_post_id IN (
      SELECT id FROM public.pet_posts WHERE profile_id = public.get_active_profile_id()
    )
  );

CREATE POLICY "Admins can manage all pet images"
  ON public.pet_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Adoption requests: requester sees own, post owner sees requests for their posts
CREATE POLICY "Requesters can view their own adoption requests"
  ON public.adoption_requests FOR SELECT
  USING (requester_profile_id = public.get_active_profile_id());

CREATE POLICY "Post owners can view adoption requests for their posts"
  ON public.adoption_requests FOR SELECT
  USING (
    pet_post_id IN (
      SELECT id FROM public.pet_posts WHERE profile_id = public.get_active_profile_id()
    )
  );

CREATE POLICY "Authenticated users can create adoption requests"
  ON public.adoption_requests FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND requester_profile_id = public.get_active_profile_id()
  );

CREATE POLICY "Requesters can cancel their own requests"
  ON public.adoption_requests FOR UPDATE
  USING (requester_profile_id = public.get_active_profile_id())
  WITH CHECK (requester_profile_id = public.get_active_profile_id());

CREATE POLICY "Post owners can approve/reject adoption requests"
  ON public.adoption_requests FOR UPDATE
  USING (
    pet_post_id IN (
      SELECT id FROM public.pet_posts WHERE profile_id = public.get_active_profile_id()
    )
  );

CREATE POLICY "Admins can manage all adoption requests"
  ON public.adoption_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Favorites: user sees own, user manages own
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (profile_id = public.get_active_profile_id());

CREATE POLICY "Users can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND profile_id = public.get_active_profile_id()
  );

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE
  USING (profile_id = public.get_active_profile_id());

-- Reports: reporter sees own, admin manages all
CREATE POLICY "Reporters can view their own reports"
  ON public.reports FOR SELECT
  USING (reporter_profile_id = public.get_active_profile_id());

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND reporter_profile_id = public.get_active_profile_id()
  );

CREATE POLICY "Admins can manage all reports"
  ON public.reports FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());