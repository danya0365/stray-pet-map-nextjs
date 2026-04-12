# Stray Pet Map — Task Tracker

> อัปเดตล่าสุด: 12 เม.ย. 2026

---

## ✅ ฟีเจอร์ที่ทำเสร็จแล้ว

### 1. Database & Schema ✅

- สร้าง migration `20260212000000_stray_pet_map_schema.sql`
- 6 tables: `pet_types`, `pet_posts`, `pet_images`, `adoption_requests`, `favorites`, `reports`
- Enums: `pet_gender`, `pet_post_status`, `adoption_request_status`, `report_reason`, `report_status`
- RLS Policies ครบทุกตาราง
- Triggers auto-update `updated_at`

### 2. Clean Architecture Foundation

- **Domain:** `src/domain/entities/pet-post.ts`
- **Application:** `src/application/repositories/IPetPostRepository.ts`, `IAuthRepository.ts`, `IFavoriteRepository.ts`, `IAdoptionRequestRepository.ts`
- **Infrastructure:**
  - Mock: `MockPetPostRepository.ts`
  - Supabase: `SupabasePetPostRepository.ts`, `SupabaseAuthRepository.ts`, `SupabaseFavoriteRepository.ts`, `SupabaseAdoptionRequestRepository.ts`, `SupabasePetTypeRepository.ts`, `SupabaseStorageRepository.ts`
- **Presenters:** Home, Map, Search, PetDetail, CreatePost, Profile, Favorites — แต่ละอันมี Presenter + ClientFactory + ServerFactory + usePresenter hook

### 3. Layout & Navigation

- `Navbar` — เมนูหลัก + ลิงก์ "โพสต์น้อง" (`/posts/create`) + UserMenu (เข้าสู่ระบบ/ออกจากระบบ)
- `Footer`
- `ThemeToggle` — Dark/Light mode (next-themes)
- `ThemeProvider`
- Responsive, Mobile-first

### 4. Reusable UI Components

- `Button`, `Card`, `Input`, `Badge`, `Modal` — อยู่ใน `src/presentation/components/ui/`
- ใช้ `class-variance-authority` สำหรับ variants

### 5. หน้าหลัก (`/`)

- `HomeView` + `PetPostCard`
- แสดง Mock pet posts พร้อมรูป, status badge, ตำแหน่ง
- Presenter pattern (HomePresenter)

### 6. หน้าแผนที่ (`/map`)

- `MapContainer`, `MapView`, `PetMarker`, `MarkerPopup`
- ปักหมุดตำแหน่งสัตว์จรบนแผนที่ (Leaflet)
- MapPresenter
- รองรับ clustering และ custom icons ตามชนิดสัตว์

### 7. หน้าค้นหา (`/search`)

- `SearchView`, `SearchFilterBar`, `NearBySection`
- Filter: สถานะ (น้องหาบ้าน, มีคนสนใจ, ตามหาน้อง, มีบ้านแล้ว)
- `LocationPickerModal` — เลือกตำแหน่งบนแผนที่
- SearchPresenter
- `useLocationStore` (Zustand)

### 8. หน้ารายละเอียดน้อง (`/pets/[id]`)

- `PetDetailView`, `PetDetailMiniMap`
- PetDetailPresenter

### 9. หน้าสร้างโพสต์ (`/posts/create`) — Multi-Step Wizard

- `CreatePostForm` — ฟอร์ม 4 ขั้นตอน + Review
- **Zod validation** — `createPostSchema.ts` + zodResolver
- **Auth Guard** — ตรวจสอบการเข้าสู่ระบบก่อนเข้าหน้าสร้างโพสต์
- **Flow:**
  - **Step 1:** จุดประสงค์ (รอรับเลี้ยง / ตามหาน้อง) + รูปภาพ (preview) + ชนิดสัตว์ (หมา/แมว)
  - **Step 2:** เลือกตำแหน่งบนแผนที่ (LocationPickerModal)
  - **Step 3:** ชื่อเรื่อง (auto-suggest จากข้อมูล step 1+2) + เพศ
  - **Step 4:** รายละเอียดเพิ่มเติม (optional, ข้ามได้) — พันธุ์, สี, อายุ, คำอธิบาย, สุขภาพ
  - **Review:** สรุปข้อมูลก่อน submit
- **UX Features:**
  - Progress bar + step counter
  - Per-step validation
  - Suggestion chips (พันธุ์ตามชนิดสัตว์, สี, อายุ, ประโยคสำเร็จรูป)
  - Auto-suggest ชื่อเรื่องจาก (ชนิด + จุดประสงค์ + ตำแหน่ง)
  - แตะ chip เลือก หรือพิมพ์เองก็ได้
  - Description chips ต่อท้ายข้อความ (ไม่ทับ)
  - ปุ่ม "ข้ามไปรีวิว" สำหรับ step 4

---

## ⏳ ฟีเจอร์ที่ยังค้าง / ต้องทำต่อ

### ระดับ High Priority

- [x] **เชื่อม Supabase จริง** — ✅ สร้าง Supabase Repositories ครบแล้ว (PetPost, Auth, Favorite, AdoptionRequest, PetType, Storage)
- [x] **Authentication** — ✅ Login/Register/Logout pages พร้อม Supabase Auth + AuthGuard middleware
- [x] **Submit โพสต์จริง** — ✅ Complete — Flow: CreatePostForm → useCreatePostPresenter → ApiPetPostRepository → /api/pet-posts → SupabasePetPostRepository → DB
- [x] **Upload รูปภาพจริง** — ✅ Complete — Flow: CreatePostForm → presenter.uploadThumbnail → ApiStorageRepository → /api/storage/upload → SupabaseStorage → thumbnails bucket
- [x] **ดึง pet_types จาก DB** — ✅ SupabasePetTypeRepository พร้อมใช้งาน

### ระดับ Medium Priority

- [x] **Adoption Request** — ✅ SupabaseAdoptionRequestRepository พร้อมแล้ว ต้องสร้าง UI ในหน้า PetDetail
- [x] **Favorites / Bookmark** — ✅ หน้า `/favorites` + SupabaseFavoriteRepository พร้อม ต้อง integrate UI
- [ ] **Search ขั้นสูง** — Filter ตาม ชนิด, พันธุ์, สี, ระยะทาง, สถานะ (ตอนนี้มีแค่สถานะ)
- [x] **หน้า Profile** — ✅ หน้า `/profile` พร้อม ต้องเพิ่มโพสต์ของตัวเอง, แก้ไข/ลบโพสต์, adoption requests
- [ ] **Reverse Geocoding** — แปลง lat/lng เป็นชื่อที่อยู่อัตโนมัติ (เพื่อ auto-suggest title ดีขึ้น)

### ระดับ Low Priority

- [ ] **Report โพสต์** — ปุ่มแจ้งรายงานโพสต์ไม่เหมาะสม
- [ ] **Notification** — แจ้งเตือนเมื่อมีคนสนใจรับเลี้ยงน้อง
- [ ] **SEO / OG Tags** — metadata สำหรับ share ลิงก์บน social
- [ ] **Admin Dashboard** — จัดการโพสต์, ดู reports, อนุมัติ/ปฏิเสธ adoption requests
- [ ] **PWA / Offline** — ทำให้ใช้งานได้เบื้องต้นแบบ offline

---

## 🎮 Feature Design: ระบบ Gamification — "ฮีโร่ช่วยน้อง"

> เป้าหมาย: กระตุ้นให้เกิด community, ให้คนมีกำลังใจโพสต์, รับเลี้ยง และบริจาค

### 1. ระบบคะแนน (Points)

| Action                          | คะแนน         | เงื่อนไข                           |
| ------------------------------- | ------------- | ---------------------------------- |
| โพสต์น้อง (สร้างโพสต์ใหม่)      | +20           | ต้องมีรูป +10 โบนัส                |
| น้องจากโพสต์ของเรามีคนรับเลี้ยง | +50           | เมื่อ adoption_request ถูก approve |
| รับเลี้ยงน้อง (adopter)         | +100          | ผู้ใจบุญ — คะแนนสูงสุด             |
| บริจาคเงิน                      | +1 ต่อ 10 บาท | cap ที่ 200/วัน กันเกม             |
| แชร์โพสต์                       | +5            | ต่อโพสต์ นับครั้งเดียว             |
| โพสต์ได้รับ ❤️ (favorite)       | +2 ต่อ like   | ได้จากคนอื่นกด                     |
| อัปเดตสถานะโพสต์                | +10           | เช่น แจ้งว่าน้องมีบ้านแล้ว         |
| โพสต์ต่อเนื่อง (streak)         | +15/วัน       | โบนัส streak 3, 7, 14, 30 วัน      |
| โพสต์แรกของวัน                  | +5            | กระตุ้นให้เข้าทุกวัน               |
| Report ที่ถูกต้อง (verified)    | +10           | รักษาคุณภาพ community              |

### 2. ระดับ/ยศ (Levels)

| Level | ชื่อยศ          | คะแนนสะสม | ไอคอน | สิทธิพิเศษ                |
| ----- | --------------- | --------- | ----- | ------------------------- |
| 1     | ผู้เริ่มต้น     | 0         | 🐾    | -                         |
| 2     | เพื่อนน้อง      | 100       | 💚    | แสดง badge ข้างชื่อ       |
| 3     | ผู้ช่วยน้อง     | 300       | 🤲    | โพสต์ปักหมุดได้           |
| 4     | นักช่วยเหลือ    | 700       | ⭐    | Custom profile frame      |
| 5     | ฮีโร่สี่ขา      | 1,500     | 🦸    | โพสต์ขึ้นหน้า featured    |
| 6     | ตำนานผู้ช่วย    | 3,000     | 👑    | Badge ทอง + แนะนำหน้าหลัก |
| 7     | ผู้พิทักษ์สัตว์ | 6,000     | 🏆    | สิทธิ์ verify โพสต์คนอื่น |

### 3. เหรียญรางวัล (Badges / Achievements)

#### 🐕 สายโพสต์

- **โพสต์แรก** — สร้างโพสต์ครั้งแรกสำเร็จ
- **นักโพสต์ขยัน** — โพสต์ครบ 10 / 50 / 100 โพสต์
- **สายตา** — โพสต์ที่ได้ ❤️ มากกว่า 50
- **ตาดี** — โพสต์น้องพร้อมรูปชัด 10 โพสต์

#### 🏠 สายรับเลี้ยง

- **บ้านแรก** — รับเลี้ยงน้องตัวแรก
- **ผู้ใจบุญ** — รับเลี้ยงครบ 3 / 5 / 10 ตัว
- **หาบ้านให้น้อง** — โพสต์ของเราถูกรับเลี้ยงครบ 5 / 10 / 20 ตัว

#### 💰 สายบริจาค

- **ผู้สนับสนุน** — บริจาคครั้งแรก
- **ใจทอง** — บริจาคสะสมครบ 500 / 1,000 / 5,000 บาท
- **ผู้อุปถัมภ์** — บริจาคติดต่อกัน 3 เดือน

#### 🔥 สาย Streak

- **ต่อเนื่อง 7 วัน** — โพสต์ 7 วันติด
- **ต่อเนื่อง 30 วัน** — โพสต์ 30 วันติด
- **ไม่มีวันหยุด** — โพสต์ 100 วันติด

#### 🌟 สายชุมชน

- **คนดังในชุมชน** — มีคนติดตาม 50 คน
- **ผู้พิทักษ์** — Report ที่ถูกต้อง 10 ครั้ง
- **ทูตน้อง** — แชร์โพสต์ 50 ครั้ง

### 4. Leaderboard (จัดอันดับ)

- **ประจำสัปดาห์** — Top 10 ผู้ทำคะแนนสูงสุดในสัปดาห์
- **ประจำเดือน** — Top 10 ผู้ทำคะแนนสูงสุดในเดือน
- **ตลอดกาล (All-time)** — Top 50 ผู้สะสมคะแนนสูงสุด
- **ตามจังหวัด** — อันดับแยกตามพื้นที่ (กระตุ้นแข่งขันในท้องถิ่น)
- **Hall of Fame** — ผู้ที่ช่วยน้องมีบ้านมากที่สุด (วัดจาก adopted count)

### 5. ระบบบริจาค (Donation)

- **ช่องทาง:** QR PromptPay / ผ่าน Stripe / TrueMoney Wallet
- **บริจาคให้น้องรายตัว** — ผูกกับ pet_post (ค่าอาหาร, ค่ารักษา)
- **บริจาคให้ชุมชน** — เข้ากองทุนกลาง
- **แสดงยอดบริจาคสะสม** — ในหน้า profile + โพสต์
- **Donor badge** — แสดงข้างชื่อว่าเป็นผู้สนับสนุน

### 6. Profile & Social

- **หน้า Profile สาธารณะ** — ยศ, badge, คะแนน, สถิติ, โพสต์, ประวัติการรับเลี้ยง
- **สถิติส่วนตัว:** น้องที่ช่วย, น้องที่มีบ้านแล้ว, วัน streak, ยอดบริจาค
- **Impact Card** — การ์ดสรุปผลกระทบ share ลง social ได้ (เช่น "ฉันช่วยน้อง 15 ตัวมีบ้านแล้ว")
- **Follow ผู้ใช้** — ติดตามคนที่ชอบ

### 7. Database Tables ที่ต้องเพิ่ม

```sql
-- ตาราง point transactions
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,          -- 'post_created', 'pet_adopted', 'donation', etc.
  points INTEGER NOT NULL,
  reference_id UUID,             -- FK to related entity (post, adoption, donation)
  reference_type TEXT,           -- 'pet_post', 'adoption_request', 'donation'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง user gamification state
CREATE TABLE public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id),
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_post_date DATE,
  pets_helped INTEGER NOT NULL DEFAULT 0,
  pets_adopted INTEGER NOT NULL DEFAULT 0,
  total_donated NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง badges ที่ปลดล็อก
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  badge_code TEXT NOT NULL,      -- 'first_post', 'adopter_3', 'streak_7', etc.
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_code)
);

-- ตาราง donations
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id),
  pet_post_id UUID REFERENCES public.pet_posts(id),  -- NULL = บริจาคกองทุนกลาง
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,   -- 'promptpay', 'stripe', 'truemoney'
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view (computed)
CREATE VIEW public.leaderboard_weekly AS
SELECT
  pt.user_id,
  p.display_name,
  p.avatar_url,
  ug.current_level,
  SUM(pt.points) AS weekly_points
FROM public.point_transactions pt
JOIN public.profiles p ON p.id = pt.user_id
JOIN public.user_gamification ug ON ug.user_id = pt.user_id
WHERE pt.created_at >= date_trunc('week', NOW())
GROUP BY pt.user_id, p.display_name, p.avatar_url, ug.current_level
ORDER BY weekly_points DESC
LIMIT 10;
```

### 8. UX ที่ต้องสร้าง

| หน้า/Component    | คำอธิบาย                                      |
| ----------------- | --------------------------------------------- |
| `ProfilePage`     | หน้า profile แสดง ยศ, badge, คะแนน, สถิติ     |
| `LeaderboardPage` | หน้าจัดอันดับ (สัปดาห์/เดือน/ตลอดกาล/จังหวัด) |
| `BadgeShowcase`   | แสดง badge ทั้งหมด (ปลดล็อก + ยังล็อก)        |
| `PointsToast`     | Toast popup "+20 คะแนน!" เมื่อได้คะแนน        |
| `LevelUpModal`    | Modal แสดงเมื่อเลื่อนยศ พร้อม animation       |
| `StreakIndicator` | แสดง streak ปัจจุบันใน Navbar / Profile       |
| `ImpactCard`      | การ์ดสรุปผลกระทบ share ลง social              |
| `DonationModal`   | ฟอร์มบริจาคเงินให้น้อง                        |
| `DonorBadge`      | Badge เล็กๆ ข้างชื่อผู้บริจาค                 |

---

## 📝 หมายเหตุ

- **Build status:** ผ่าน
- **Lint status:** ผ่าน (แก้ไข React Compiler warning แล้ว)
- **Supabase Repositories:** พร้อมใช้งาน 6 ตัว (PetPost, Auth, Favorite, AdoptionRequest, PetType, Storage)
- **Integration Status:** ✅ CreatePostForm เชื่อมต่อกับ Supabase ผ่าน API routes เรียบร้อยแล้ว
