import { CheckCircle, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ขอบคุณสำหรับการสนับสนุน | StrayPetMap",
  description: "คุณกำลังช่วยเหลือสัตว์จรจัดและสนับสนุนนักพัฒนา",
};

export default function DonateSuccessPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold">ขอบคุณมากๆ!</h1>

        {/* Message */}
        <p className="mb-6 text-muted-foreground">
          การสนับสนุนของคุณช่วยให้เราสามารถพัฒนา StrayPetMap ต่อไปได้
          <br />
          และช่วยเหลือสัตว์จรจัดได้มากขึ้น
        </p>

        {/* Heart Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Heart className="h-16 w-16 fill-primary text-primary" />
            <span className="absolute -right-2 -top-2 text-2xl">🐱</span>
            <span className="absolute -bottom-2 -left-2 text-2xl">🐶</span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          <Link
            href="/road-map"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            ดู Roadmap ว่าจะพัฒนาอะไรต่อ
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าแรก
          </Link>
        </div>

        {/* Receipt Note */}
        <p className="mt-8 text-xs text-muted-foreground">
          คุณจะได้รับใบเสร็จทางอีเมล (ถ้าระบุอีเมล)
        </p>
      </div>
    </div>
  );
}
