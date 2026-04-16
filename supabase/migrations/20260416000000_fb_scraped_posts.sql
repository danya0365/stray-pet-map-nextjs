-- FB Scraped Posts — Data from Facebook Group Scraper
-- Created: 2026-04-16
-- Author: Marosdee Uma
-- Description: Table for storing raw scraped posts from Facebook groups
--              + Storage bucket for scraped images

-- ============================================================================
-- Storage bucket for scraped images
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('scraped-images', 'scraped-images', true, false)
ON CONFLICT (id) DO NOTHING;

-- Public read for scraped images
CREATE POLICY "Scraped images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'scraped-images');

-- Service role can write (scraper uses service_role key, bypasses RLS anyway)
CREATE POLICY "Service role can manage scraped images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'scraped-images' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'scraped-images' AND auth.role() = 'service_role');

-- Admins can manage scraped images
CREATE POLICY "Admins can manage scraped images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'scraped-images' AND
    public.get_active_profile_role() = 'admin'::public.profile_role
  )
  WITH CHECK (
    bucket_id = 'scraped-images' AND
    public.get_active_profile_role() = 'admin'::public.profile_role
  );

-- ============================================================================
-- Table: fb_scraped_posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fb_scraped_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Facebook metadata
  fb_post_id    TEXT UNIQUE NOT NULL,       -- ID โพสต์ FB (ป้องกัน duplicate)
  author_name   TEXT,                       -- ชื่อผู้โพสต์
  content       TEXT,                       -- ข้อความในโพสต์
  posted_at     TIMESTAMPTZ,               -- วันที่โพสต์
  source_url    TEXT,                       -- URL โพสต์ต้นทาง

  -- Images
  image_urls    TEXT[] DEFAULT '{}',        -- Original FB CDN URLs (อาจหมดอายุ)
  storage_urls  TEXT[] DEFAULT '{}',        -- Supabase Storage public URLs (ถาวร)

  -- Classification (manual review หรือ AI parse ทีหลัง)
  animal_type   TEXT,                       -- dog, cat, rabbit, other
  animal_status TEXT DEFAULT 'unknown',     -- unknown, stray, injured, fed, adopted

  -- Location (parsed จากข้อความ หรือกรอกทีหลัง)
  location_text TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,

  -- Processing status (สำหรับ workflow review → import เข้า pet_posts)
  is_processed        BOOLEAN DEFAULT FALSE,
  linked_pet_post_id  UUID REFERENCES public.pet_posts(id) ON DELETE SET NULL,

  -- Metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fb_scraped_posts_fb_post_id ON public.fb_scraped_posts(fb_post_id);
CREATE INDEX IF NOT EXISTS idx_fb_scraped_posts_posted_at ON public.fb_scraped_posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_fb_scraped_posts_animal_type ON public.fb_scraped_posts(animal_type);
CREATE INDEX IF NOT EXISTS idx_fb_scraped_posts_is_processed ON public.fb_scraped_posts(is_processed);
CREATE INDEX IF NOT EXISTS idx_fb_scraped_posts_linked ON public.fb_scraped_posts(linked_pet_post_id)
  WHERE linked_pet_post_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.fb_scraped_posts ENABLE ROW LEVEL SECURITY;

-- Policy: อ่านได้ทุกคน
CREATE POLICY "FB scraped posts are viewable by everyone"
  ON public.fb_scraped_posts FOR SELECT USING (true);

-- Policy: service_role เขียนได้ (scraper ใช้ service_role key)
CREATE POLICY "Service role can manage fb scraped posts"
  ON public.fb_scraped_posts FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: admin จัดการได้ทุกอย่าง
CREATE POLICY "Admins can manage fb scraped posts"
  ON public.fb_scraped_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at
CREATE TRIGGER update_fb_scraped_posts_updated_at
  BEFORE UPDATE ON public.fb_scraped_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
