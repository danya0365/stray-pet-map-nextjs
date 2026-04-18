import { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | StrayPetMap",
  description: "นโยบายการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคลของ StrayPetMap",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">นโยบายความเป็นส่วนตัว</h1>
      
      <div className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">1. การเก็บข้อมูลผู้สนับสนุน</h2>
          <p className="mb-4 text-muted-foreground">
            เมื่อคุณสนับสนุน StrayPetMap เราอาจเก็บข้อมูลต่อไปนี้:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>ชื่อที่แสดง (display name) - สำหรับแสดงในกระดานผู้สนับสนุน (ถ้ายินยอม)</li>
            <li>อีเมล - สำหรับส่งใบเสร็จรับเงิน (optional)</li>
            <li>ยอดการสนับสนุนและวันที่ - สำหรับบันทึกทางบัญชี</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">2. การใช้ข้อมูล</h2>
          <p className="mb-4 text-muted-foreground">
            ข้อมูลของคุณจะถูกใช้เพื่อ:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>ออกใบเสร็จรับเงิน</li>
            <li>แสดงในกระดานผู้สนับสนุน (ถ้าคุณเลือกแสดงชื่อ)</li>
            <li>ส่งข้อความขอบคุณหรืออัพเดตความคืบหน้า (ถ้าคุณให้อีเมล)</li>
            <li>คำนวณแต้ม gamification (ฮีโร่ช่วยน้อง)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">3. การไม่ระบุตัวตน (Anonymous)</h2>
          <p className="mb-4 text-muted-foreground">
            คุณมีสิทธิ์เลือกไม่ประสงค์ออกนาม (anonymous) ได้:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>ชื่อจะแสดงเป็น &quot;ผู้ใจดีไม่ประสงค์ออกนาม&quot;</li>
            <li>ไม่แสดงในกระดานผู้สนับสนุน (ถ้าเลือก)</li>
            <li>ข้อมูลอีเมลยังคงจำเป็นสำหรับส่งใบเสร็จ (ถ้าระบุ)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">4. การแชร์ข้อมูลกับบุคคลที่สาม</h2>
          <p className="mb-4 text-muted-foreground">
            เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคล การแชร์ข้อมูลมีเฉพาะ:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Stripe - สำหรับประมวลผลการชำระเงิน</li>
            <li>Supabase - สำหรับจัดเก็บข้อมูล (ฐานข้อมูลส่วนบุคคลของเรา)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">5. ระยะเวลาการเก็บข้อมูล</h2>
          <p className="mb-4 text-muted-foreground">
            เราเก็บข้อมูลการสนับสนุนไม่ต่ำกว่า 7 ปี ตามข้อกำหนดทางบัญชีภาษี 
            แต่คุณสามารถขอให้ลบข้อมูลส่วนบุคคล (ชื่อ, อีเมล) ได้ทุกเมื่อ 
            โดยข้อมูลการเงินจะถูกเก็บไว้ตามกฎหมาย
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">6. สิทธิ์ของคุณ</h2>
          <p className="mb-4 text-muted-foreground">
            คุณมีสิทธิ์:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>ขอดูข้อมูลที่เราเก็บไว้เกี่ยวกับคุณ</li>
            <li>ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
            <li>ขอลบข้อมูล (ยกเว้นข้อมูลทางบัญชีที่กฎหมายกำหนด)</li>
            <li>ถอนความยินยอมในการแสดงชื่อได้ทุกเมื่อ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">7. ความปลอดภัย</h2>
          <p className="mb-4 text-muted-foreground">
            ข้อมูลการชำระเงินทั้งหมดผ่าน Stripe (PCI DSS compliant) 
            เราไม่เก็บข้อมูลบัตรเครดิตไว้ในระบบของเราเอง
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">8. การเปลี่ยนแปลงนโยบาย</h2>
          <p className="mb-4 text-muted-foreground">
            หากมีการเปลี่ยนแปลงนโยบายความเป็นส่วนตัว เราจะแจ้งให้ทราบผ่านอีเมล 
            (ถ้าคุณให้อีเมลไว้) หรือแสดงประกาศในแอป
          </p>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          อัพเดตล่าสุด: 17 เมษายน 2026
        </p>
      </div>
    </div>
  );
}
