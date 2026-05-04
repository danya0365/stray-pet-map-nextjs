# โปรเจ็ค Stray Pet Map

## Prompt สำหรับสั่งให้ AI สร้าง CONTEXT.md

ช่วยเขียนสรุป skill context ณ ปัจจุบันให้หน่อย

เพื่อให้โปรเจคสามารถเขียนได้ต่อเนื่อง

โดยเขียนใน /Users/marosdeeuma/stray-pet-map-nextjs/.agents/CONTEXT.md

## Prompt สำหรับให้ AI สร้าง Roadmap ฟีเจอร์ใหม่ (v1 — ตามยอดบริจาคอย่างเดียว)

ช่วยสร้างหน้าใหม่ชื่อ road-map

โดยหน้านี้

เราจะมี road map ที่คิดว่าเราจะทำ โดยขึ้นอยู่กับ ยอดบริจาค ของโปรเจค จากผู้สนับสนุนทางบ้านครับ

เพราะแน่นอนว่า ทุกอย่างคือต้นทุน ถ้ายอด บริจาคถึงจำนวนเท่านั้น เท่านี้ เราจะเพิ่มฟีเจอร์เด็ดๆ เข้ามาเรื่อยๆ

ผมขอให้คุณลอง วางแผนฟีเจอร์เด็ดๆ ตาม road map ให้หน่อย

ออกแบบเพื่อกระตุ้นให้ user อยากบริจาค

---

## Prompt สำหรับให้ AI สร้าง Roadmap แบบ Dual-track (v2 — กำหนดการ + Fast-track บริจาค)

> **แนวคิด:** ทุกฟีเจอร์มีกำหนดการ (deadline) ตายตัวอยู่แล้ว — ทำแน่นอน ไม่มีการล็อคถาวร
> แต่ถ้ายอดบริจาคถึงเป้าก่อน เราเริ่มทำทันที โดยไม่ต้องรอ deadline
> ไม่กดดัน user แต่กระตุ้นให้อยากช่วยให้ฟีเจอร์มาเร็วขึ้น

---

ช่วยสร้างหน้าใหม่ชื่อ `road-map` ตาม Clean Architecture pattern ของโปรเจคนี้

### โครงสร้างที่ต้องสร้าง

1. `src/application/repositories/IRoadMapRepository.ts`
2. `src/infrastructure/repositories/mock/MockRoadMapRepository.ts`
3. `src/presentation/presenters/road-map/RoadMapPresenter.ts`
4. `src/presentation/presenters/road-map/RoadMapPresenterServerFactory.ts`
5. `src/presentation/components/road-map/RoadMapView.tsx`
6. `app/road-map/page.tsx`

### Data Model ที่ต้องมีใน `RoadMapFeature`

```typescript
interface RoadMapFeature {
  id: string;
  icon: string; // emoji
  title: string;
  description: string;
  status: "done" | "in_progress" | "locked";

  // Dual-track fields
  plannedQuarter?: string; // เช่น "Q3 2026" — ทำแน่นอนภายใน quarter นี้
  donationGoal?: number; // เช่น 5000 — ถ้ายอดสะสมถึงนี้ → เริ่มทำทันที
}
```

### UI ที่ต้องแสดงในแต่ละ feature row

- ถ้ามี `plannedQuarter` → แสดง badge `📅 กำหนด Q3 2026`
- ถ้ามี `donationGoal` และยังไม่ถึง → แสดง `⚡ Fast-track ฿X,XXX` พร้อม mini progress bar
- ถ้า `donationGoal` ถึงแล้ว → แสดง `⚡ Fast-track พร้อมเริ่ม!` (สีเขียว)

### Legend / คำอธิบายที่ต้องมีในหน้า

แสดง panel อธิบายระบบ dual-track ให้ user เข้าใจ:

- **สถานะฟีเจอร์**: done / in_progress / locked
- **ระบบ Dual-track**: กำหนดการ (ทำแน่นอน) vs Fast-track (บริจาคเร็วกว่า = ได้เร็วกว่า)

### Messaging หลักที่ต้อง communicate

- ทุกฟีเจอร์จะทำแน่นอนตามกำหนด — **ไม่มีการล็อคถาวร ไม่มีการบังคับบริจาค**
- บริจาคเพื่อช่วยให้ทีมเริ่มทำ **ทันที** โดยไม่ต้องรอ deadline
- กระตุ้นด้วยความรู้สึก "ช่วยกันให้ฟีเจอร์มาเร็วขึ้น" ไม่ใช่ "ต้องบริจาคไม่งั้นไม่ได้ใช้"

### Tier structure แนะนำ

จัดฟีเจอร์เป็น Tier ตามยอดสะสม:

- 🐾 ฟรีเสมอ (฿0) — ฟีเจอร์พื้นฐาน
- 🌱 Seed (฿5,000)
- 🌿 Sprout (฿15,000)
- 🌸 Bloom (฿30,000)
- 🦁 Champion (฿60,000)
- 👑 Legend (฿100,000)

แต่ละ Tier มี `targetAmount` (ยอดสะสมถึงระดับนี้) และแต่ละฟีเจอร์ใน Tier มี `donationGoal` (fast-track goal อาจน้อยกว่า targetAmount)

### สิ่งที่ต้องมีในหน้า

1. **Hero header** — ชื่อ Road Map + คำอธิบายสั้น
2. **Donation Progress Bar** — ยอดสะสมปัจจุบัน / เป้าหมาย tier ถัดไป
3. **Dual-track Legend** (panel อธิบายระบบ)
4. **Tier Grid** — grid ของ Tier Card แต่ละอัน
5. **Community Note** — อธิบาย philosophy no-pressure
6. **Donation CTA Section** — กระตุ้นบริจาค (QR placeholder, amount chips)

## Prompt สำหรับ สั่ง AI ให้แก้โค้ดให้ตรงตามข้อกำหนด

รีวิวอันนี้นะคับ

/Users/marosdeeuma/stray-pet-map-nextjs/src/presentation/components/pet-detail/PetDetailContainer.tsx

ผมอยากให้แก้ตรง fetchFundingGoal

ต้องเรียก action จาก usePetDetailPresenter

ตาม rules ที่เราเขียนไว้ใน /Users/marosdeeuma/stray-pet-map-nextjs/.agents/skills/create-page/references/CREATE_PAGE_PATTERN.md
