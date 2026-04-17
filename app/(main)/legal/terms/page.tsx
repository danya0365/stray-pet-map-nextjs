import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เงื่อนไขการใช้งานและการสนับสนุน | StrayPetMap",
  description: "ข้อกำหนดและเงื่อนไขการใช้งานแพลตฟอร์ม StrayPetMap รวมถึงการสนับสนุน/ให้กำลังใจ",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">เงื่อนไขการใช้งานและการสนับสนุน</h1>
      
      <div className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">1. สถานะทางกฎหมาย</h2>
          <p className="mb-4 text-muted-foreground">
            StrayPetMap ดำเนินการโดยบุคคลธรรมดา ไม่ใช่นิติบุคคล (ไม่ได้จดทะเบียนเป็นบริษัทหรือมูลนิธิ) 
            ผู้ดำเนินการเป็นนักพัฒนาอิสระที่สร้างแพลตฟอร์มนี้ด้วยความตั้งใจช่วยเหลือสัตว์จรจัด
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">2. การสนับสนุน (Support/Tipping)</h2>
          <p className="mb-4 text-muted-foreground">
            การโอนเงินผ่านระบบ StrayPetMap ถือเป็น <strong>การสนับสนุน/ให้กำลังใจ (tipping)</strong> 
            ไม่ใช่การบริจาคตามกฎหมายว่าด้วยการกุศลสาธารณะ
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>ผู้สนับสนุนไม่ได้รับสิทธิ์หักภาษีจากการสนับสนุน</li>
            <li>StrayPetMap ไม่ใช่องค์กรสาธารณะกุศล</li>
            <li>เงินสนับสนุนไม่เข้ากองทุนสาธารณะ</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">3. โหมดการสนับสนุน</h2>
          <div className="mb-4 space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground">3.1 กำลังใจ Dev</h3>
              <p>เงินสนับสนุนเข้าบัญชีทีมพัฒนาโดยตรง ถือเป็นการให้กำลังใจ (tipping) แก่นักพัฒนา</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">3.2 สนับสนุนแพลตฟอร์ม</h3>
              <p>เงินสนับสนุนใช้สำหรับค่าใช้จ่ายในการพัฒนาแพลตฟอร์มต่อไป (เซิร์ฟเวอร์, โดเมน, API)</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">3.3 ให้ผู้ดูแลน้อง</h3>
              <p>StrayPetMap เป็นเพียงช่องทางแนะนำ เงินจะส่งต่อให้ผู้ดูแลน้องโดยตรง (peer-to-peer) 
              เราไม่ใช่ตัวกลางรับเงินในกรณีนี้</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">4. การคืนเงิน</h2>
          <p className="mb-4 text-muted-foreground">
            การสนับสนุนทุกกรณีเป็นไปโดย <strong>สมัครใจและไม่มีการคืนเงิน</strong> 
            ยกเว้นกรณีมีข้อผิดพลาดทางเทคนิคที่พิสูจน์ได้
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">5. ความโปรงใส</h2>
          <p className="mb-4 text-muted-foreground">
            เรามุ่งมั่นให้ความโปรงใสสูงสุด:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Roadmap แสดงแผนพัฒนาชัดเจน</li>
            <li>กระดานผู้สนับสนุนแสดงยอดรวม (ไม่ระบุรายบุคคลโดยละเอียด)</li>
            <li>ไม่มีการล็อคฟีเจอร์ไว้รอเงิน - ทุกฟีเจอร์มีแผนทำแน่นอน</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">6. การเปลี่ยนแปลงเงื่อนไข</h2>
          <p className="mb-4 text-muted-foreground">
            เงื่อนไขนี้อาจมีการเปลี่ยนแปลงตามกฎหมายหรือสถานะนิติบุคคลในอนาคต 
            หากมีการจดทะเบียนนิติบุคคล (บริษัท/มูลนิธิ) จะแจ้งให้ทราบล่วงหน้า
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">7. ติดต่อ</h2>
          <p className="text-muted-foreground">
            หากมีคำถามเกี่ยวกับการสนับสนุน กรุณาติดต่อผ่านหน้า 
            <Link href="/about" className="text-primary hover:underline">เกี่ยวกับเรา</Link>
          </p>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          อัพเดตล่าสุด: 17 เมษายน 2026
        </p>
      </div>
    </div>
  );
}
