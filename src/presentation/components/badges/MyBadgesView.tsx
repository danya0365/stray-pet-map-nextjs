"use client";

import type { Badge, BadgeProgress } from "@/domain/entities/badge";
import { cn } from "@/presentation/lib/cn";
import {
  AlertCircle,
  Award,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { BadgeDisplay } from "./BadgeDisplay";
import { BadgeProgressCard } from "./BadgeProgress";

interface MyBadgesViewProps {
  data: {
    badges: Badge[];
    totalBadges: number;
    progress: BadgeProgress[];
  } | null;
  isLoading: boolean;
  error: string | null;
  isChecking: boolean;
  onCheckBadges: () => void;
}

export function MyBadgesView({
  data,
  isLoading,
  error,
  isChecking,
  onCheckBadges,
}: MyBadgesViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-foreground/20" />
        <p className="mt-3 text-sm font-medium text-foreground/60">{error}</p>
        {error.includes("เข้าสู่ระบบ") && (
          <Link
            href="/auth/login"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    );
  }

  if (!data) return null;

  const { badges, totalBadges, progress } = data;

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              ตราสัญลักษณ์ที่ได้รับ
            </p>
            <p className="text-3xl font-bold">{totalBadges}</p>
          </div>
        </div>
      </div>

      {/* Check Badges Button */}
      <div className="flex justify-center">
        <button
          onClick={onCheckBadges}
          disabled={isChecking}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all",
            "border border-border bg-card hover:bg-accent hover:text-accent-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
          {isChecking ? "กำลังตรวจสอบ..." : "ตรวจสอบตราสัญลักษณ์ใหม่"}
        </button>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">ตราสัญลักษณ์ที่ได้รับ</h2>

        {badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all hover:shadow-md"
              >
                <BadgeDisplay badge={badge} size="lg" showTooltip={false} />
                <div>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                  {badge.earnedValue && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      ทำได้ {badge.earnedValue} ครั้ง
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
            <Sparkles className="h-12 w-12 text-foreground/20" />
            <p className="mt-3 text-sm font-medium text-foreground/60">
              ยังไม่มีตราสัญลักษณ์
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              เริ่มต้นสร้างโพสต์ช่วยเหลือสัตว์เพื่อรับตราสัญลักษณ์แรก!
            </p>
            <Link
              href="/posts/create"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              สร้างโพสต์แรก
            </Link>
          </div>
        )}
      </div>

      {/* Progress Section */}
      {progress.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">ความคืบหน้า</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {progress.map((p) => (
              <BadgeProgressCard key={p.type} progress={p} />
            ))}
          </div>
        </div>
      )}

      {/* Hall of Fame Link */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">ดู Hall of Fame</span>
          </div>
          <Link
            href="/badges"
            className="text-sm font-medium text-primary hover:underline"
          >
            ดูทั้งหมด →
          </Link>
        </div>
      </div>
    </div>
  );
}
