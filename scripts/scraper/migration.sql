-- ===================================================
-- Stray Animals Map - Supabase Migration
-- ===================================================

create extension if not exists "uuid-ossp";

create table if not exists stray_animals (
  id uuid default gen_random_uuid() primary key,

  -- ข้อมูลจาก Facebook
  fb_post_id    text unique,           -- ID โพสต์ (ป้องกัน duplicate)
  author_name   text,                  -- ชื่อผู้โพสต์
  content       text,                  -- ข้อความในโพสต์
  posted_at     timestamptz,           -- วันที่โพสต์
  source_url    text,                  -- URL โพสต์ต้นทาง

  -- รูปภาพ
  image_urls    text[]  default '{}',  -- URL รูปบน Facebook
  images_local  text[]  default '{}',  -- path รูปที่ download ไว้

  -- ข้อมูลสัตว์ (กรอกทีหลังหรือ AI parse)
  animal_type   text,                  -- 'dog' | 'cat' | 'other'
  animal_status text default 'stray',  -- 'stray' | 'adopted' | 'fed'

  -- ตำแหน่ง (กรอกทีหลัง)
  location_text text,                  -- ข้อความบอกสถานที่
  lat           float8,
  lng           float8,

  -- Metadata
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index สำหรับ query บ่อย
create index if not exists idx_stray_animals_posted_at   on stray_animals(posted_at desc);
create index if not exists idx_stray_animals_animal_type on stray_animals(animal_type);
create index if not exists idx_stray_animals_status      on stray_animals(animal_status);

-- Enable RLS
alter table stray_animals enable row level security;

-- Policy: อ่านได้ทุกคน
create policy "Public read" on stray_animals
  for select using (true);

-- Policy: insert/update เฉพาะ service role (scraper ใช้ service_role key)
create policy "Service role write" on stray_animals
  for all using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_stray_animals_updated_at
  before update on stray_animals
  for each row execute function update_updated_at();
