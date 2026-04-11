import { PawPrint, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <PawPrint className="h-5 w-5" />
          StrayPetMap
        </Link>

        <p className="flex items-center gap-1 text-xs text-foreground/50">
          สร้างด้วย <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />{" "}
          เพื่อสัตว์จรทุกตัว
        </p>

        <nav className="flex gap-4 text-xs text-foreground/50">
          <Link href="/about" className="transition-colors hover:text-primary">
            เกี่ยวกับเรา
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-primary"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </nav>
      </div>
    </footer>
  );
}
