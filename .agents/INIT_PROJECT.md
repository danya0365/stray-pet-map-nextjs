# โครงสร้างคำสั่งเริ่มต้นโปรเจค (Initial Project Prompt)

**คำอธิบาย:** ไฟล์นี้ใช้เป็น Prompt เริ่มต้น (System Instruction) สำหรับให้ AI เข้าใจโครงสร้าง, เทคโนโลยี, และรูปแบบการเขียนโค้ดของโปรเจค โดยอิงตาม Clean Architecture

---

## 📌 Context ย่อ

- **Project Name:** `stray-pet-map`
- **Description:** ระบบแผนที่ + ค้นหา + รับเลี้ยงหมาแมวจร — แนวคิด "ช่วยให้สัตว์มีบ้าน" สร้างแพลตฟอร์มกลางสำหรับ: โพสต์ตำแหน่งสัตว์จร, ค้นหาสัตว์ตามสเปก, เชื่อมคนอยากเลี้ยง ↔ คนช่วยสัตว์

## 👥 ใครที่ต้องใช้ไฟล์นี้บ้าง?

ไฟล์นี้ทำหน้าที่เหมือน **"สัญญาว่าจ้างและคู่มือเริ่มงาน"** ระหว่าง:

1. **Developer (คุณ / Tech Lead):** ใช้เป็นตัวคุมโทน คุม Architecture และกำหนดกฎเกณฑ์ไม่ให้ AI เขียนโค้ดกระจัดกระจาย
2. **AI Assistant (เช่น Cursor, Windsurf, ChatGPT):** ใช้เป็น System Prompt เพื่ออ่านทำความเข้าใจและเซ็ตบริบท (Context) ของโปรเจกต์ทั้งหมดก่อนเริ่ม Generate Code

### 💡 Use Case ในชีวิตจริง:

- **Scenario A (รับงาน Freelance ใหม่):** คุณเพิ่งรับงาน แทนที่จะต้องมานั่งพิมพ์สั่ง AI ว่า "ใช้ Next.js นะ ใช้ Supabase ด้วย โฟลเดอร์ให้จัดแบบนี้..." คุณแค่ก็อปวางไฟล์นี้ เปลี่ยนชื่อโปรเจกต์ แล้วส่งให้ AI อ่านจบใน 1 วินาที
- **Scenario B (AI ลืมกฎ / บริบทหลุด):** ในระหว่างที่เขียนโค้ดไปหลายสิบไฟล์แล้ว AI อาจจะเริ่ม "หลอน" ลืมว่าต้องใช้ Clean Architecture คุณสามารถสั่ง AI ว่า _"ให้กลับไปอ่านกฎใน INIT_PROJECT.md แล้วแก้โค้ดนี้ใหม่"_
- **Scenario C (Onboarding ทีมงานใหม่):** ไฟล์นี้สามารถใช้ส่งให้ Junior Developer ในทีมอ่าน เพื่อให้เข้าใจ Tech Stack และ Workflow ของโปรเจกต์ได้รวดเร็ว

---

## 🛠️ Technology Stack & Constraints

- **Framework:** Next.js 16+ (App Router เท่านั้น)
- **Database & Auth:** Supabase (SSR/Server Client) — `@supabase/ssr`, `@supabase/supabase-js`
- **Language:** TypeScript (Strict Mode)
- **Styling:** TailwindCSS v4 + Global CSS อยู่ที่ `app/globals.css` (ใช้ `clsx`, `tailwind-merge`, `class-variance-authority` สำหรับ conditional styles)
- **State Management:** Zustand v5 (สร้าง store ไว้ที่ `src/presentation/stores/`)
- **Form & Validation:** React Hook Form v7 คู่กับ Zod v4 เท่านั้น
- **Data Fetching:** Server Components คู่กับ Presenter Pattern + TanStack React Query v5
- **Animation:** react-spring v10
- **Icons:** lucide-react
- **Date Utility:** dayjs
- **Theme:** next-themes (Dark/Light mode toggle)
- **Fonts:** Geist + Geist_Mono คู่กับ Noto_Sans_Thai จาก `next/font/google`
- **Print:** react-to-print

## 🗄️ Database Schema (Supabase)

> **หมายเหตุ:** โปรเจคนี้ clone มาจากโปรเจคอื่น — migration files อื่นๆ ใน `supabase/migrations/` (เช่น profiles, security policies) ยังคงใช้ต่อ
>
> Schema เฉพาะ stray-pet-map อยู่ที่ `supabase/migrations/20260212000000_stray_pet_map_schema.sql`

Tables พื้นฐาน (จากโปรเจคเดิม):

| Table           | คำอธิบาย                          |
| --------------- | --------------------------------- |
| `profiles`      | ข้อมูลผู้ใช้ (extends auth.users) |
| `profile_roles` | Role management (student / admin) |

Tables เฉพาะ stray-pet-map (6 tables):

| Table               | คำอธิบาย                                   |
| ------------------- | ------------------------------------------ |
| `pet_types`         | ชนิดสัตว์ (หมา, แมว, กระต่าย ฯลฯ)          |
| `pet_posts`         | โพสต์สัตว์จร — ตำแหน่ง, รายละเอียด, สถานะ  |
| `pet_images`        | รูปภาพของแต่ละโพสต์ (1 post → many images) |
| `adoption_requests` | คำขอรับเลี้ยง (ใครอยากรับเลี้ยงตัวไหน)     |
| `favorites`         | บุ๊คมาร์คโพสต์ที่สนใจ                      |
| `reports`           | แจ้งรายงานโพสต์ที่ไม่เหมาะสม               |

## 🐾 Feature Requirements

ขอบเขตระบบหลัก (อ้างอิงจาก User):

1. **โพสต์ตำแหน่งสัตว์จร** — ปักหมุดบนแผนที่ พร้อมรูปภาพและรายละเอียด
2. **ค้นหาสัตว์ตามสเปก** — Filter ตามชนิด, พันธุ์, ตำแหน่ง, สถานะ ฯลฯ
3. **เชื่อมคนอยากเลี้ยง ↔ คนช่วยสัตว์** — ระบบจับคู่/ติดต่อเพื่อรับเลี้ยง

## 🚨 กฎเหล็ก (Core Rules)

1. **Architecture:** โครงสร้างโค้ดต้องอิงตามฟอร์แมต SOLID & Clean Architecture อย่างเคร่งครัด
   - `/app` — มีหน้าที่แค่ Routing, ฝัง Metadata และเรียกใช้ View Components
   - `/src/domain` — เก็บ Types (รวมถึง Supabase Types) และ Entities หลัก
   - `/src/application` — เก็บ Interfaces ของ Repositories
   - `/src/infrastructure` — เก็บ Implementation ของ Repository (เช่น Supabase Call)
   - `/src/presentation` — เก็บ UI Components, Hooks, Stores และ Presenters
2. **Page Creation:** ทุกครั้งที่สร้าง Page/Feature ใหม่ **ต้อง**ทำตาม Pattern ที่กำหนดไว้ใน `.agents/skills/create-page/SKILL.md`
3. **Repository Creation:** ทุกครั้งที่สร้าง data layer ใหม่ **ต้อง**ทำตาม Pattern ที่กำหนดไว้ใน `.agents/skills/create-repo/SKILL.md`
4. **Feature Requirements:** ยึดขอบเขตระบบจาก section 🐾 Feature Requirements ด้านบนเสมอ
5. **No Assumption & No Floating Code:** ห้ามคิดฟีเจอร์เพิ่มเองนอกเหนือจากที่ระบุ และห้ามนำ Business Logic ไปผูกติดกับ UI Component โดยตรง ต้องผ่าน Presenter หรือ Hook เสมอ

---

## 🚀 แผนการทำงาน (Step-by-Step Execution)

> **⚠️ สำคัญมากสำหรับ AI:** กรุณาทำงานทีละขั้นตอนตามลำดับด้านล่างนี้ เมื่อเสร็จแต่ละ Step ให้ "หยุดรอ" เพื่อให้ฉัน (User) ตรวจสอบและอนุมัติ (Approve) ก่อน จึงจะดำเนินการใน Step ถัดไปได้ ห้ามทำรวดเดียวจบ

### Step 1: Database & System Design

- รับ Schema ใหม่จาก User (สำหรับ stray-pet-map โดยเฉพาะ)
- ตรวจสอบ Database Schema (Tables และความสัมพันธ์)
- ออกแบบ Interface/Type สำหรับ Mock Data เบื้องต้น
- 🛑 **[AI Stop & Ask]** หยุดทำงานและถามฉันว่า "Schema และ Data Structure นี้โอเคหรือไม่? มีส่วนไหนต้องการปรับเพิ่มก่อนเริ่มเขียนโค้ด UI หรือไม่?"

### Step 2: Core Layout & Navigation Setup

- สร้างหน้า MainLayout (`app/layout.tsx` และ Shared Components เช่น Navbar, Sidebar, Footer)
- ออกแบบ Theme และ Mood & Tone: **สดใส น่ารัก อบอุ่น** — สีสัน pastel, ไอคอนน่ารัก, เน้นความเป็นมิตรกับสัตว์
- ใช้ Geist + Noto Sans Thai เป็น Font หลัก
- ติดตั้ง Theme Toggle (Dark/Light mode) ผ่าน next-themes
- ต้องรองรับ Responsive Design (Mobile-first approach)
- เตรียม Placeholder สำหรับ Auth State (เช่น ปุ่ม Login / User Profile) ไว้ใน Header
- 🛑 **[AI Stop & Ask]** หยุดทำงานและรอฉันทดสอบ Layout เบื้องต้น

### Step 3: Reusable UI Components

- สร้าง UI Components พื้นฐานที่จำเป็นต้องใช้ซ้ำบ่อยๆ (เช่น Button, Card, Input, Badge, Modal) ตาม Design System
- ใช้ `class-variance-authority` สำหรับ component variants
- ใส่ Animation ด้วย react-spring (hover, active states)
- ใช้ lucide-react สำหรับ Icons
- 🛑 **[AI Stop & Ask]** หยุดทำงานและรอฉันรีวิว Components

### Step 4: Core Features Implementation

- นำ Components จาก Step 3 มาประกอบเป็นหน้าแรก (`app/page.tsx`) — Landing Page พร้อมแผนที่
- เริ่มต้นวางโครงสร้างไฟล์ Presenter, Repository และ UseCases สำหรับ Feature แรก ตาม `.agents/skills/create-page/SKILL.md`
- 🛑 **[AI Stop & Ask]** ติดตามผลและรอคำสั่งต่อไป
