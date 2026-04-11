import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function PetNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <PawPrint className="mx-auto mb-4 h-16 w-16 text-foreground/20" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          ไม่พบน้องตัวนี้
        </h1>
        <p className="mb-6 text-foreground/60">
          โพสต์นี้อาจถูกลบ หรือ URL ไม่ถูกต้อง
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            กลับหน้าแรก
          </Link>
          <Link
            href="/map"
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            เปิดแผนที่
          </Link>
        </div>
      </div>
    </div>
  );
}
