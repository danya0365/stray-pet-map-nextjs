# FB Group Scraper — StrayPetMap

ดึงโพสต์จาก Facebook Public Group → Insert เข้า Supabase + Upload รูปเข้า Supabase Storage

## Setup

```bash
# 1. Install dependencies (จาก project root)
yarn add -D tsx dotenv playwright

# 2. Install Chromium browser สำหรับ Playwright
npx playwright install chromium

# 3. รัน Supabase migration (สร้าง table + storage bucket)
supabase db reset
# หรือรัน SQL ใน supabase/migrations/20260416000000_fb_scraped_posts.sql ที่ Dashboard
```

## Config

Script อ่านค่าจากไฟล์ `.env` ที่ root ของโปรเจค — ใช้ตัวแปรเดียวกับ Next.js app:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ ใช้ **service_role key** เพราะ anon key ถูกบล็อกโดย RLS policy

## Run

```bash
# Default (เปิด browser, ไม่จำกัดจำนวน)
yarn scrape:fb

# ซ่อน browser
yarn scrape:fb --headless

# จำกัดจำนวนโพสต์
yarn scrape:fb --max-posts=50

# เพิ่มเวลาหน่วง scroll (ถ้าโดน rate limit)
yarn scrape:fb --scroll-delay=5000

# รวม flags
yarn scrape:fb --headless --max-posts=100 --scroll-delay=4000
```

## โครงสร้างไฟล์

```
scripts/scraper/
├── fb-group-scraper.ts   ← Script หลัก (TypeScript, integrated กับ Supabase ของโปรเจค)
├── scraper.mjs           ← Script เดิม (standalone, เก็บไว้เป็น reference)
├── migration.sql         ← SQL เดิม (ย้ายไป supabase/migrations/ แล้ว)
└── README.md

supabase/migrations/
└── 20260416000000_fb_scraped_posts.sql   ← Migration จริง (table + storage bucket)
```

## Database

### Table: `fb_scraped_posts`

| Column               | Type        | คำอธิบาย                                      |
| -------------------- | ----------- | --------------------------------------------- |
| `fb_post_id`         | TEXT UNIQUE | ID โพสต์ FB (ป้องกัน duplicate)               |
| `author_name`        | TEXT        | ชื่อผู้โพสต์                                  |
| `content`            | TEXT        | ข้อความในโพสต์                                |
| `posted_at`          | TIMESTAMPTZ | วันที่โพสต์                                   |
| `source_url`         | TEXT        | URL โพสต์ต้นทาง                               |
| `image_urls`         | TEXT[]      | Original FB CDN URLs (อาจหมดอายุ)             |
| `storage_urls`       | TEXT[]      | Supabase Storage public URLs (ถาวร)           |
| `animal_type`        | TEXT        | ชนิดสัตว์ — กรอกทีหลัง หรือ AI parse          |
| `animal_status`      | TEXT        | สถานะสัตว์ — กรอกทีหลัง                       |
| `is_processed`       | BOOLEAN     | ผ่านการ review แล้วหรือยัง                    |
| `linked_pet_post_id` | UUID        | FK ไป pet_posts เมื่อ import เข้าระบบหลักแล้ว |

### Storage Bucket: `scraped-images`

- Public bucket — อ่านได้ทุกคน
- เขียนได้เฉพาะ service_role (scraper) และ admin
- Path format: `fb/{fb_post_id}/{index}.jpg`

## Flow

```
Facebook Group → Playwright Scraper → Supabase
                                       ├── fb_scraped_posts (table)
                                       └── scraped-images (storage)
                                              ↓
                                       Admin Review (ทีหลัง)
                                              ↓
                                       pet_posts (table หลัก)
```

## หมายเหตุ

- Default เปิด browser เพื่อดูว่าทำงานถูก — ใช้ `--headless` เมื่อมั่นใจแล้ว
- ถ้า FB แสดง popup ให้ login — script จะพยายามปิดอัตโนมัติ
- หาก scroll แล้วไม่โหลดใหม่ ลองเพิ่ม `--scroll-delay=5000`
- รูปถูก upload เข้า Supabase Storage แล้ว — ไม่ต้อง download local
- Script จะข้าม duplicate อัตโนมัติ (เช็คจาก `fb_post_id`)
