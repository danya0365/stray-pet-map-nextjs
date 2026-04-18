import { Code, Heart, Mail, MapPin, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา | StrayPetMap",
  description:
    "ทำความรู้จัก StrayPetMap - แพลตฟอร์มช่วยเหลือสัตว์จรจัดโดยคนไทย เพื่อคนไทย",
};

export default function AboutPage() {
  const appDomain = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
    : "straypetmap.online";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-primary/10 via-secondary/5 to-background py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            StrayPetMap
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            แพลตฟอร์มแผนที่สัตว์จรจัด โดยคนไทย เพื่อคนไทย
            <br />
            <span className="text-primary">
              เชื่อมโยงผู้ใจดีกับสัตว์ที่ต้องการความช่วยเหลือ
            </span>
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold">แผนที่รวมศูนย์</h3>
            <p className="text-sm text-muted-foreground">
              รวมข้อมูลสัตว์จรจัดจากทั่วประเทศไว้ในที่เดียว หาง่าย ช่วยสะดวก
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
              <Users className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="mb-2 font-semibold">เชื่อมโยงชุมชน</h3>
            <p className="text-sm text-muted-foreground">
              เชื่อมต่อผู้ใจดีกับผู้ดูแลน้อง สร้างเครือข่ายช่วยเหลือสัตว์
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Heart className="h-7 w-7 text-accent" />
            </div>
            <h3 className="mb-2 font-semibold">สนับสนุนโปร่งใส</h3>
            <p className="text-sm text-muted-foreground">
              ระบบสนับสนุนที่ชัดเจน รู้ว่าเงินไปไหน ใช้ทำอะไร
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="border-y border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold">
            เรื่องราวของเรา
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              StrayPetMap เกิดจากความตั้งใจของนักพัฒนาคนไทยที่อยากใช้ทักษะ
              ของตัวเองช่วยแก้ปัญหาสัตว์จรจัดในประเทศไทย
            </p>
            <p>
              เราเชื่อว่าเทคโนโลยีสามารถช่วยให้การช่วยเหลือสัตว์มีประสิทธิภาพมากขึ้น
              จากการหาบ้านให้น้องหาย ไปจนถึงการระดมทุนเพื่อค่ารักษาพยาบาล
            </p>
            <p>
              แพลตฟอร์มนี้เป็นโปรเจกต์ที่ดำเนินการโดยบุคคลธรรมดา
              ไม่ใช่องค์กรใหญ่ แต่ทำด้วยใจและความตั้งใจจริง
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">ทีมงาน</h2>
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Code className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="mb-2 text-xl font-semibold">นักพัฒนาอิสระ</h3>
              <p className="mb-4 text-muted-foreground">
                StrayPetMap ดำเนินการโดยนักพัฒนาซอฟต์แวร์อิสระคนไทย
                ที่สร้างและดูแลแพลตฟอร์มนี้ในเวลาว่างจากงานประจำ
              </p>
              <p className="text-sm text-muted-foreground">
                เราไม่ใช่มูลนิธิหรือบริษัทใหญ่ แต่เป็นเพียงคนธรรมดาที่อยากใช้
                ความสามารถของตัวเองสร้างสิ่งดีๆ ให้สังคม
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Status */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <span className="text-lg">⚖️</span>
            สถานะทางกฎหมาย
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            StrayPetMap ดำเนินการโดยบุคคลธรรมดา (Individual) ไม่ใช่นิติบุคคล
            ไม่ได้จดทะเบียนเป็นบริษัทหรือมูลนิธิ
          </p>
          <p className="text-sm text-muted-foreground">
            การสนับสนุนผ่านแพลตฟอร์มเป็นการให้กำลังใจ (tipping)
            ไม่ใช่การบริจาคตามกฎหมายว่าด้วยการกุศลสาธารณะ
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/legal/terms"
              className="text-xs font-medium text-primary underline hover:text-primary/80"
            >
              อ่านเงื่อนไขการใช้งาน →
            </Link>
            <Link
              href="/legal/privacy"
              className="text-xs font-medium text-primary underline hover:text-primary/80"
            >
              นโยบายความเป็นส่วนตัว →
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-6 text-2xl font-bold">ติดต่อเรา</h2>
          <p className="mb-6 text-muted-foreground">
            มีคำถาม ข้อเสนอแนะ หรืออยากร่วมงานกับเรา?
            <br />
            ติดต่อมาได้เลย
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:contact@${appDomain}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl"
            >
              <Mail className="h-5 w-5" />
              ส่งอีเมลหาเรา
            </a>
            <a
              href="https://github.com/straypetmap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-background px-6 py-3 font-medium transition-all hover:border-primary hover:text-primary"
            >
              <Code className="h-5 w-5" />
              GitHub ↗
            </a>
          </div>
        </div>
      </div>

      {/* Roadmap CTA */}
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="mb-4 text-xl font-semibold">แผนพัฒนาต่อไป</h2>
        <p className="mb-6 text-muted-foreground">
          อยากรู้ว่าเรามีแผนทำอะไรต่อ? ไปดู Roadmap ของเราได้เลย
        </p>
        <Link
          href="/road-map"
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary to-secondary px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Heart className="h-5 w-5" />
          ดู Roadmap
        </Link>
      </div>
    </div>
  );
}
