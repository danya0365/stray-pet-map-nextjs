"use client";

import { Heart, PawPrint, Trophy } from "lucide-react";
import Link from "next/link";
import { useDonationContext } from "../donation/DonationProvider";

export function Footer() {
  const { open } = useDonationContext();

  return (
    <footer className="mt-auto hidden border-t border-border/40 bg-background md:block">
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

        <nav className="flex flex-wrap justify-center gap-4 text-xs text-foreground/50">
          <button
            onClick={open}
            className="transition-colors hover:text-primary"
          >
            สนับสนุน
          </button>
          <Link
            href="/donate/leaderboard"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Trophy className="h-3 w-3" />
            ฮีโร่
          </Link>
          <Link
            href="/road-map"
            className="transition-colors hover:text-primary"
          >
            Roadmap
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            เกี่ยวกับเรา
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-primary"
          >
            นโยบาย
          </Link>
        </nav>
      </div>
    </footer>
  );
}
