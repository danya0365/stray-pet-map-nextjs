"use client";

import { animated, useTransition } from "@react-spring/web";
import { Heart, Map, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "straypetmap-banner-dismissed";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const dismissedAt = new Date(raw).getTime();
    return Date.now() - dismissedAt > WEEK_MS;
  } catch {
    return true;
  }
}

function recordDismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}

function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}
function subscribe() {
  return () => {};
}

export function SupportBanner() {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shouldShow()) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const transitions = useTransition(open, {
    from: { opacity: 0, y: 40, scale: 0.92 },
    enter: { opacity: 1, y: 0, scale: 1 },
    leave: { opacity: 0, y: 40, scale: 0.92 },
    config: { tension: 320, friction: 24 },
  });

  const handleClose = () => {
    setOpen(false);
    recordDismiss();
  };

  // Don't render anything server-side / before mount
  if (!mounted) return null;

  return transitions((style, show) =>
    show ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <animated.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          style={{ opacity: style.opacity }}
          onClick={handleClose}
        />

        {/* Banner card */}
        <animated.div
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-2xl"
          style={{
            opacity: style.opacity,
            transform: style.y.to(
              (y) => `translateY(${y}px) scale(${style.scale.get()})`,
            ),
          }}
          role="dialog"
          aria-modal="true"
          aria-label="ข้อความจากทีม StrayPetMap"
        >
          {/* Decorative top bar */}
          <div className="relative overflow-hidden bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 px-6 pt-8 pb-4">
            {/* Floating emoji */}
            <div className="absolute -right-2 -top-2 text-6xl opacity-10 rotate-12 select-none">
              🐾
            </div>
            <div className="absolute left-4 top-3 text-4xl opacity-10 -rotate-12 select-none">
              🐕
            </div>

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-foreground/40 transition-colors hover:bg-black/5 hover:text-foreground/70"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-4xl">
                <span className="animate-bounce">🐕</span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  💕
                </span>
                <span
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  🐈
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                โฮ่ง! โม้ว! นี่เรานะ 🐾
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 px-6 py-5">
            <p className="text-center text-sm font-medium text-primary">
              ใช้งานฟรี 100% — ไม่มีโฆษณา ไม่มี paywall!
            </p>

            <div className="space-y-3 text-sm leading-relaxed text-foreground/80">
              <p>
                แต่พวกเรา{" "}
                <span className="font-semibold text-foreground">
                  (ทีมคน + ทีมขนฟู 🐕🐈)
                </span>{" "}
                อยู่ได้เพราะจิตอาสาเท่านั้น
              </p>
              <p>
                ค่า server, ค่าพัฒนา, ค่าดูแลระบบ — ออกจากกระเป๋าพวกเขาเอง! 🎒
              </p>
              <p className="text-center font-medium text-foreground">
                ยิ่งคุณสนับสนุน เราก็ยิ่งได้อยู่ช่วยน้องๆ ต่อไปนานๆ 💛
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              ไม่บังคับ ไม่กดดัน — แค่อยากให้รู้ว่าใครอยู่เบื้องหลังน้องๆ
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href="/road-map"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-secondary py-3 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                <Map className="h-4 w-4" />
                ดูว่าเราจะทำอะไรต่อ →
              </Link>

              <Link
                href="/donate"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Heart className="h-4 w-4 text-red-400" />
                สนับสนุนทีมขนฟู 💛
              </Link>
            </div>

            {/* Legal note */}
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3 text-[10px] leading-relaxed text-muted-foreground">
              <p className="mb-1 font-medium text-foreground/60">หมายเหตุ:</p>
              <p>
                StrayPetMap ดำเนินการโดยบุคคลธรรมดา ไม่ใช่นิติบุคคล
                การสนับสนุนเป็นการให้กำลังใจ (tipping) ไม่ใช่การบริจาคตามกฎหมาย
                ใบเสร็จรับเงินไม่สามารถนำไปหักภาษีได้
              </p>
            </div>
          </div>

          {/* Dismiss text */}
          <button
            onClick={handleClose}
            className="w-full py-3 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground/60"
          >
            เข้าใจแล้ว ขอบคุณที่บอก! 👋
          </button>
        </animated.div>
      </div>
    ) : null,
  );
}
