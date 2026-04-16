# StrayPetMap — Project Context

> อัปเดตล่าสุด: 13 เม.ย. 2026  
> ไฟล์นี้สรุปบริบทโปรเจคทั้งหมด เพื่อให้ AI หรือ Developer สามารถต่อยอดได้ทันทีโดยไม่ต้องสำรวจใหม่

---

## 1. ภาพรวมโปรเจค

- **ชื่อ:** `stray-pet-map`
- **แนวคิด:** แพลตฟอร์มแผนที่รวมจุดสัตว์จร — ช่วยให้สัตว์มีบ้าน
- **เป้าหมาย:** โพสต์ตำแหน่งสัตว์จร, ค้นหาสัตว์ตามสเปก, เชื่อมคนอยากเลี้ยง ↔ คนช่วยสัตว์
- **Mood & Tone:** สดใส น่ารัก อบอุ่น — สีสัน pastel, ไอคอนน่ารัก, เน้นความเป็นมิตรกับสัตว์

---

## 2. Technology Stack

| หมวด              | เทคโนโลยี                                                               |
| ----------------- | ----------------------------------------------------------------------- |
| **Framework**     | Next.js 16+ (App Router), TypeScript Strict                             |
| **Database/Auth** | Supabase (`@supabase/ssr`, `@supabase/supabase-js`)                     |
| **Styling**       | TailwindCSS v4 + `clsx` + `tailwind-merge` + `class-variance-authority` |
| **State**         | Zustand v5 (`src/presentation/stores/`)                                 |
| **Form**          | React Hook Form v7 + Zod v4                                             |
| **Data Fetching** | Server Components + Presenter Pattern + TanStack React Query v5         |
| **Map**           | MapLibre GL + react-map-gl                                              |
| **Animation**     | react-spring v10                                                        |
| **Icons**         | lucide-react                                                            |
| **Date**          | dayjs                                                                   |
| **Theme**         | next-themes (Dark/Light)                                                |
| **Fonts**         | Geist + Geist_Mono + Noto_Sans_Thai                                     |
| **Print**         | react-to-print                                                          |
| **Output**        | Standalone (Docker-ready)                                               |

---

## 3. Architecture (Clean Architecture + SOLID)

```
app/                          → Routing + Metadata + View mounting
src/
├── domain/
│   ├── entities/             → Business entities (PetPost, Badge)
│   └── types/                → Supabase generated types
├── application/
│   └── repositories/         → Repository interfaces (I*Repository)
├── infrastructure/
│   ├── repositories/
│   │   ├── api/              → Client-side API repositories (fetch → /api/*)
│   │   ├── mock/             → Mock data repositories
│   │   └── supabase/         → Server-side Supabase repositories
│   └── supabase/             → Supabase client setup (client, server, admin)
└── presentation/
    ├── components/           → UI components (atomic design)
    ├── hooks/                → Custom hooks
    ├── lib/                  → Utility (cn)
    ├── presenters/           → Presenter pattern (per feature)
    ├── stores/               → Zustand stores
    └── validations/          → Zod schemas
```

### Presenter Pattern (ทุก feature)

แต่ละ feature ประกอบด้วย 4 ไฟล์:

1. **`XxxPresenter.ts`** — Business logic class
2. **`XxxPresenterClientFactory.ts`** — สร้าง Presenter ฝั่ง client (ใช้ Api\* Repositories)
3. **`XxxPresenterServerFactory.ts`** — สร้าง Presenter ฝั่ง server (ใช้ Supabase\* Repositories)
4. **`useXxxPresenter.ts`** — React hook ที่เรียกใช้ Presenter

### Path Aliases

- `@/*` → `./src/*`
- `@app/*` → `./app/*`

---

## 4. Database Schema

### Migration Files (`supabase/migrations/`)

| ไฟล์                                        | เนื้อหา                                                      |
| ------------------------------------------- | ------------------------------------------------------------ |
| `20250618000000_initial_schema.sql`         | Profiles + base tables (จากโปรเจคเดิม)                       |
| `20250618000001_security_policies.sql`      | RLS Policies                                                 |
| `20250618000002_api_functions.sql`          | API Functions                                                |
| `20250618000003_storage.sql`                | Storage buckets                                              |
| `20250619000001_profile_functions.sql`      | Profile helper functions                                     |
| `20250811000000_backend_user_functions.sql` | Backend user management                                      |
| `20260212000000_stray_pet_map_schema.sql`   | **Core schema** — 6 tables, enums, RLS                       |
| `20260412000000_add_badges_system.sql`      | **Badges/Gamification** — badge types, tiers, profile_badges |

### Core Tables (stray-pet-map)

| Table               | คำอธิบาย                                  |
| ------------------- | ----------------------------------------- |
| `pet_types`         | ชนิดสัตว์ (หมา, แมว, กระต่าย ฯลฯ)         |
| `pet_posts`         | โพสต์สัตว์จร — ตำแหน่ง, รายละเอียด, สถานะ |
| `pet_images`        | รูปภาพของแต่ละโพสต์ (1:N)                 |
| `adoption_requests` | คำขอรับเลี้ยง                             |
| `favorites`         | บุ๊คมาร์คโพสต์                            |
| `reports`           | แจ้งรายงานโพสต์ไม่เหมาะสม                 |
| `profile_badges`    | ตราสัญลักษณ์ (Gamification)               |

### Enums

- `pet_gender`: male, female, unknown
- `pet_post_status`: available, pending, adopted, missing
- `pet_post_purpose`: lost_pet, rehome_pet, community_cat
- `adoption_request_status`: pending, approved, rejected, cancelled
- `report_reason` / `report_status`
- `badge_type`: first_post, successful_adoption, pet_finder, rescue_hero, active_helper, super_helper, quick_responder, verified_rescuer
- `badge_tier`: bronze, silver, gold, platinum

### Key Domain Concepts

- **`purpose`** = จุดประสงค์โพสต์ที่ user เลือก (lost_pet / rehome_pet / community_cat)
- **`status`** = สถานะระบบที่เปลี่ยนอัตโนมัติ (available / pending / adopted / missing)
- **`outcome`** = ผลลัพธ์สุดท้ายเมื่อโพสต์จบ (owner_found / rehomed / cancelled / expired / admin_closed)

---

## 5. Repository Layer

### Interfaces (`src/application/repositories/`)

| Interface                    | หน้าที่                           |
| ---------------------------- | --------------------------------- |
| `IPetPostRepository`         | CRUD โพสต์สัตว์, ค้นหา, filter    |
| `IAuthRepository`            | Login, Register, Logout, Session  |
| `IFavoriteRepository`        | Toggle favorite, get favorites    |
| `IAdoptionRequestRepository` | สร้าง/จัดการคำขอรับเลี้ยง         |
| `IPetTypeRepository`         | ดึงรายการชนิดสัตว์                |
| `IStorageRepository`         | Upload/manage รูปภาพ              |
| `IBadgeRepository`           | ดึง badges, progress, leaderboard |

### Implementations

| Layer    | ไฟล์                                | ใช้ที่              |
| -------- | ----------------------------------- | ------------------- |
| **API**  | `ApiPetPostRepository`              | Client Components   |
| **API**  | `ApiAdoptionRequestRepository`      | Client Components   |
| **API**  | `ApiPetTypeRepository`              | Client Components   |
| **API**  | `ApiStorageRepository`              | Client Components   |
| **Supa** | `SupabasePetPostRepository`         | API Routes / Server |
| **Supa** | `SupabaseAuthRepository`            | API Routes / Server |
| **Supa** | `SupabaseFavoriteRepository`        | API Routes / Server |
| **Supa** | `SupabaseAdoptionRequestRepository` | API Routes / Server |
| **Supa** | `SupabasePetTypeRepository`         | API Routes / Server |
| **Supa** | `SupabaseStorageRepository`         | API Routes / Server |
| **Supa** | `SupabaseBadgeRepository`           | API Routes / Server |
| **Mock** | `MockPetPostRepository`             | Development / Test  |

---

## 6. API Routes (`app/api/`)

| Route                                  | Method     | คำอธิบาย                            |
| -------------------------------------- | ---------- | ----------------------------------- |
| `/api/pet-posts`                       | GET, POST  | ดึง/สร้างโพสต์                      |
| `/api/pet-posts/[id]`                  | GET, PATCH | ดึง/อัปเดตโพสต์เฉพาะตัว             |
| `/api/pet-posts/auto-archive`          | POST       | Auto-archive โพสต์หมดอายุ           |
| `/api/pet-posts/success-stories`       | GET        | ดึง success stories                 |
| `/api/pet-types`                       | GET        | ดึงรายการชนิดสัตว์                  |
| `/api/adoption-requests`               | GET, POST  | คำขอรับเลี้ยง                       |
| `/api/adoption-requests/has-requested` | GET        | เช็คว่า user ขอรับเลี้ยงแล้วหรือยัง |
| `/api/adoption-requests/my-requests`   | GET        | ดึงคำขอรับเลี้ยงของตัวเอง           |
| `/api/storage/upload`                  | POST       | อัปโหลดรูปภาพ                       |
| `/api/badges`                          | GET        | ดึงข้อมูล badges                    |
| `/api/badges/profile`                  | GET        | ดึง badges ของ profile              |

---

## 7. Pages & Features

| Route             | หน้า                       | Components หลัก                                                 | สถานะ        |
| ----------------- | -------------------------- | --------------------------------------------------------------- | ------------ |
| `/`               | หน้าหลัก                   | `HomeView`, `PetPostCard`, `BadgeHomeSection`, `SuccessStories` | ✅ เสร็จ     |
| `/map`            | แผนที่                     | `MapContainer`, `MapView`, `PetMarker`, `MarkerPopup`           | ✅ เสร็จ     |
| `/search`         | ค้นหา                      | `SearchView`, `SearchFilterBar`, `LocationPickerModal`          | ✅ เสร็จ     |
| `/pets/[id]`      | รายละเอียดน้อง             | `PetDetailView`, `PetDetailMiniMap`, `AdoptionRequestModal`     | ✅ เสร็จ     |
| `/posts/create`   | สร้างโพสต์ (4-step wizard) | `CreatePostForm` + Zod validation + AuthGuard                   | ✅ เสร็จ     |
| `/auth/login`     | เข้าสู่ระบบ                | Supabase Auth                                                   | ✅ เสร็จ     |
| `/auth/register`  | สมัครสมาชิก                | Supabase Auth                                                   | ✅ เสร็จ     |
| `/auth/callback`  | Auth callback              | OAuth redirect handler                                          | ✅ เสร็จ     |
| `/favorites`      | รายการโปรด                 | `FavoritesView`                                                 | ✅ พื้นฐาน   |
| `/profile`        | โปรไฟล์                    | `ProfileView`                                                   | ⏳ ต้องเพิ่ม |
| `/profile/badges` | ตราสัญลักษณ์ของฉัน         | `MyBadgesContainer`, `MyBadgesView`                             | ✅ เสร็จ     |
| `/badges`         | Badges & Leaderboard       | `BadgeSection`, `BadgeLeaderboard`                              | ✅ เสร็จ     |

---

## 8. Presentation Components

### Layout

- `Navbar` — เมนูหลัก + ลิงก์ "โพสต์น้อง" + UserMenu
- `Footer`
- `ThemeProvider` + `AuthProvider`

### UI Base (`src/presentation/components/ui/`)

- `Button`, `Card`, `Input`, `Badge`, `Modal` — ใช้ `class-variance-authority` สำหรับ variants

### Feature Components

| โฟลเดอร์           | Components                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home/`            | `HomeView`, `PetPostCard`                                                                                                                                                         |
| `map/`             | `MapContainer`, `MapView`, `PetMarker`, `MarkerPopup`                                                                                                                             |
| `search/`          | `SearchView`, `SearchFilterBar`, `NearBySection`, `LocationPickerModal`                                                                                                           |
| `pet-detail/`      | `PetDetailView`, `PetDetailMiniMap`, `PetDetailImages`                                                                                                                            |
| `create-post/`     | `CreatePostForm` (multi-step wizard)                                                                                                                                              |
| `adoption/`        | `AdoptionRequestModal`                                                                                                                                                            |
| `close-post/`      | ClosePost component                                                                                                                                                               |
| `favorites/`       | Favorites components                                                                                                                                                              |
| `badges/`          | `BadgeDisplay`, `BadgeHomeSection`, `BadgeLeaderboard`, `BadgeLeaderboardContainer`, `BadgeLeaderboardView`, `BadgeProgress`, `BadgeSection`, `MyBadgesContainer`, `MyBadgesView` |
| `success-stories/` | Success stories component                                                                                                                                                         |
| `profile/`         | Profile component                                                                                                                                                                 |
| `auth/`            | Auth components                                                                                                                                                                   |
| `providers/`       | `ThemeProvider`, `AuthProvider`                                                                                                                                                   |

### Stores (Zustand)

- `useAuthStore` — สถานะ Authentication
- `useLocationStore` — เก็บตำแหน่งที่เลือก (สำหรับ Search/Create)

### Presenters

| Feature     | Presenter             | Hook                     |
| ----------- | --------------------- | ------------------------ |
| Home        | `HomePresenter`       | `useHomePresenter`       |
| Map         | `MapPresenter`        | `useMapPresenter`        |
| Search      | `SearchPresenter`     | `useSearchPresenter`     |
| Pet Detail  | `PetDetailPresenter`  | `usePetDetailPresenter`  |
| Create Post | `CreatePostPresenter` | `useCreatePostPresenter` |

---

## 9. Gamification System (Badges)

### สถานะปัจจุบัน

- **DB Migration:** ✅ `20260412000000_add_badges_system.sql`
- **Entity:** ✅ `src/domain/entities/badge.ts` — Badge, BadgeProgress, ProfileWithBadges, BADGE_DEFINITIONS, TIER_REQUIREMENTS
- **Interface:** ✅ `IBadgeRepository`
- **Repository:** ✅ `SupabaseBadgeRepository`
- **API Routes:** ✅ `/api/badges`, `/api/badges/profile`
- **UI Components:** ✅ BadgeDisplay, BadgeHomeSection, BadgeLeaderboard, BadgeProgress, BadgeSection, MyBadgesContainer, MyBadgesView

### Badge Types

| Type                  | ชื่อ                           | Tiers                             |
| --------------------- | ------------------------------ | --------------------------------- |
| `first_post`          | นักช่วยเหลือมือใหม่            | bronze                            |
| `successful_adoption` | ผู้ให้บ้านที่อบอุ่น            | bronze → silver → gold → platinum |
| `pet_finder`          | นักสืบสัตว์เลี้ยง              | bronze → silver → gold            |
| `rescue_hero`         | ฮีโร่แมวจร                     | bronze → silver → gold            |
| `active_helper`       | นักช่วยเหลือขยัน               | silver                            |
| `super_helper`        | ซูเปอร์ฮีโร่สัตว์              | gold                              |
| `quick_responder`     | สายฟ้า                         | silver                            |
| `verified_rescuer`    | นักช่วยเหลือที่ได้รับการยืนยัน | platinum                          |

---

## 10. Supabase Setup

- **Client:** `src/infrastructure/supabase/client.ts` — Browser client
- **Server:** `src/infrastructure/supabase/server.ts` — Server-side client (cookies)
- **Admin:** `src/infrastructure/supabase/admin.ts` — Service role client
- **Storage Bucket:** `thumbnails` — สำหรับรูปภาพโพสต์
- **Env Vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 11. สิ่งที่เสร็จแล้ว ✅

1. **Database & Schema** — 6 core tables + badges system + RLS
2. **Clean Architecture** — Domain → Application → Infrastructure → Presentation
3. **Supabase Repositories** — 7 ตัว (PetPost, Auth, Favorite, AdoptionRequest, PetType, Storage, Badge)
4. **API Repositories** — 4 ตัว (PetPost, AdoptionRequest, PetType, Storage)
5. **Authentication** — Login/Register/Logout + Supabase Auth + AuthGuard
6. **หน้าหลัก** — HomeView + PetPostCard + BadgeHomeSection
7. **แผนที่** — MapLibre + PetMarker + MarkerPopup + Clustering
8. **ค้นหา** — SearchFilterBar + LocationPickerModal
9. **รายละเอียดน้อง** — PetDetailView + MiniMap + AdoptionRequestModal
10. **สร้างโพสต์** — 4-step wizard + Zod validation + Upload รูป + Submit จริง
11. **Adoption Request** — API + Modal + Repository
12. **Favorites** — หน้า + Repository
13. **Badges System** — DB + Entity + Repository + API + UI Components (Display, Leaderboard, Progress, MyBadges)
14. **Theme** — Dark/Light mode toggle
15. **Layout** — Navbar + Footer + Responsive Mobile-first

---

## 12. สิ่งที่ยังค้าง ⏳

### High Priority

- [ ] **หน้า Profile เพิ่มเติม** — แสดงโพสต์ของตัวเอง, แก้ไข/ลบโพสต์, adoption requests ที่ได้รับ

### Medium Priority

- [ ] **Search ขั้นสูง** — Filter ตาม ชนิด, พันธุ์, สี, ระยะทาง (ตอนนี้มีแค่สถานะ)
- [ ] **Reverse Geocoding** — แปลง lat/lng เป็นชื่อที่อยู่ (auto-suggest title)

### Low Priority

- [ ] **Report โพสต์** — แจ้งรายงานโพสต์ไม่เหมาะสม
- [ ] **Notification** — แจ้งเตือนเมื่อมีคนสนใจรับเลี้ยง
- [ ] **SEO / OG Tags** — metadata สำหรับ share ลิงก์
- [ ] **Admin Dashboard** — จัดการโพสต์, ดู reports
- [ ] **PWA / Offline**

### Gamification ที่ยังไม่ได้ทำ

- [ ] **ระบบคะแนน (Points)** — point_transactions, user_gamification tables
- [ ] **ระดับ/ยศ (Levels)** — 7 ระดับจาก "ผู้เริ่มต้น" ถึง "ผู้พิทักษ์สัตว์"
- [ ] **Leaderboard** — สัปดาห์/เดือน/ตลอดกาล/ตามจังหวัด
- [ ] **Donation System** — QR PromptPay / Stripe / TrueMoney
- [ ] **Impact Card** — สรุปผลกระทบ share ลง social
- [ ] **PointsToast / LevelUpModal / StreakIndicator** — UX gamification

---

## 13. Build & Lint Status

- **Build:** ✅ ผ่าน
- **Lint:** ✅ ผ่าน
- **Integration:** ✅ CreatePostForm เชื่อม Supabase ผ่าน API routes เรียบร้อย
- **Next.js Version:** 16.2.3 (⚠️ มี breaking changes — ต้องอ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ดใหม่)

---

## 14. Skills & Patterns

- **Create Page:** `.agents/skills/create-page/SKILL.md` — Pattern สร้างหน้าใหม่
- **Create Repo:** `.agents/skills/create-repo/SKILL.md` — Pattern สร้าง Repository ใหม่
- **Init Project:** `.agents/skills/init-project/` — Pattern เริ่มโปรเจค

---

## 15. หมายเหตุสำคัญ

1. ห้ามสั่ง `yarn build`, `yarn dev`, `npx next build`, `npx next dev` — User ทดสอบเอง
2. ทุก Business Logic ต้องผ่าน Presenter หรือ Hook — ห้ามผูกติด UI โดยตรง
3. ห้ามคิดฟีเจอร์เพิ่มเองนอกเหนือจากที่ระบุ
4. ใช้ `@supabase/ssr` สำหรับ server-side, ไม่ใช้ `@supabase/auth-helpers-nextjs`
5. Global CSS อยู่ที่ `public/styles/index.css` (ไม่ใช่ `app/globals.css`)
