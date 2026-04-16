import { MyBadgesContainer } from "@/presentation/components/badges/MyBadgesContainer";
import { ArrowLeft, Award } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "ตราสัญลักษณ์ของฉัน - Stray Pet Map",
  description: "ดูตราสัญลักษณ์และความสำเร็จการช่วยเหลือสัตว์ของคุณ",
};

export default function MyBadgesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back Link */}
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าโปรไฟล์
      </Link>

      <h1 className="mb-6 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
        <Award className="h-8 w-8 text-primary" />
        ตราสัญลักษณ์ของฉัน
      </h1>

      <MyBadgesContainer />
    </div>
  );
}
