"use client";

import type {
  FeatureStatus,
  RoadMapFeature,
  RoadMapStats,
  RoadMapTier,
  RoadMapTierData,
  RoadMapViewModel,
} from "@/application/repositories/IRoadMapRepository";
import { cn } from "@/presentation/lib/cn";
import {
  Calendar,
  Check,
  Clock,
  Heart,
  Lock,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Tier color mapping ────────────────────────────────────
const TIER_STYLE: Record<
  RoadMapTier,
  {
    ring: string;
    badge: string;
    bar: string;
    glow: string;
    text: string;
  }
> = {
  free: {
    ring: "ring-secondary/40",
    badge: "bg-secondary/15 text-secondary",
    bar: "bg-secondary",
    glow: "shadow-secondary/20",
    text: "text-secondary",
  },
  seed: {
    ring: "ring-primary/40",
    badge: "bg-primary/15 text-primary",
    bar: "bg-primary",
    glow: "shadow-primary/20",
    text: "text-primary",
  },
  sprout: {
    ring: "ring-secondary/40",
    badge: "bg-secondary/15 text-secondary",
    bar: "bg-secondary",
    glow: "shadow-secondary/20",
    text: "text-secondary",
  },
  bloom: {
    ring: "ring-accent/40",
    badge: "bg-accent/15 text-accent",
    bar: "bg-accent",
    glow: "shadow-accent/20",
    text: "text-accent",
  },
  champion: {
    ring: "ring-orange-400/40",
    badge:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    bar: "bg-orange-400",
    glow: "shadow-orange-400/20",
    text: "text-orange-500",
  },
  legend: {
    ring: "ring-yellow-400/40",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    bar: "bg-gradient-to-r from-accent via-primary to-secondary",
    glow: "shadow-yellow-400/30",
    text: "text-yellow-600 dark:text-yellow-400",
  },
};

// ─── Feature status icon ───────────────────────────────────
function StatusIcon({ status }: { status: FeatureStatus }) {
  if (status === "done")
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
        <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
      </span>
    );
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
      <Lock className="h-3 w-3 text-foreground/30" />
    </span>
  );
}

// ─── Feature row (with dual-track schedule) ─────────────────
function FeatureRow({
  feat,
  currentAmount,
}: {
  feat: RoadMapFeature;
  currentAmount: number;
}) {
  const isDone = feat.status === "done";
  const isInProgress = feat.status === "in_progress";
  const isLocked = feat.status === "locked";

  // Fast-track: has a donationGoal and current amount hasn't reached it yet
  const hasFastTrack = !!feat.donationGoal && !isDone;
  const fastTrackReached = hasFastTrack && currentAmount >= feat.donationGoal!;
  const fastTrackPercent = hasFastTrack
    ? Math.min(100, Math.round((currentAmount / feat.donationGoal!) * 100))
    : 0;

  return (
    <li className="flex flex-col gap-1.5">
      {/* Title row */}
      <div className="flex items-start gap-3">
        <StatusIcon status={feat.status} />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold leading-snug",
              isLocked && !fastTrackReached && "text-foreground/50",
            )}
          >
            <span className="mr-1">{feat.icon}</span>
            {feat.title}
          </p>
          <p className="mt-0.5 text-xs text-foreground/40">
            {feat.description}
          </p>
        </div>
      </div>

      {/* Dual-track schedule tags — only for non-done features */}
      {!isDone && (feat.plannedQuarter || hasFastTrack) && (
        <div className="ml-8 flex flex-wrap items-center gap-2">
          {/* Planned deadline — always shows */}
          {feat.plannedQuarter && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/50">
              <Calendar className="h-2.5 w-2.5" />
              กำหนด {feat.plannedQuarter}
            </span>
          )}

          {/* Fast-track chip */}
          {hasFastTrack && !fastTrackReached && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <Zap className="h-2.5 w-2.5" />
                Fast-track ฿{feat.donationGoal!.toLocaleString()}
              </span>
              {/* Mini progress toward fast-track goal */}
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${fastTrackPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-foreground/35">
                  {fastTrackPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Fast-track reached badge */}
          {fastTrackReached && (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Zap className="h-2.5 w-2.5" />
              Fast-track พร้อมเริ่ม!
            </span>
          )}

          {/* In-progress note */}
          {isInProgress && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <Clock className="h-2.5 w-2.5" />
              กำลังพัฒนา
            </span>
          )}
        </div>
      )}
    </li>
  );
}

// ─── Donation Progress Bar ─────────────────────────────────
function DonationProgress({ stats }: { stats: RoadMapStats }) {
  const nextTierAmount = (() => {
    const map: Record<string, number> = {
      seed: 5000,
      sprout: 15000,
      bloom: 30000,
      champion: 60000,
      legend: 100000,
    };
    return stats.nextTier ? map[stats.nextTier] : null;
  })();

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      {/* Header row */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground/50">
            ยอดสนับสนุนสะสม
          </p>
          <p className="text-3xl font-bold text-primary">
            ฿{stats.currentAmount.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:text-right">
          <div>
            <p className="text-sm font-medium text-foreground/50">
              ผู้สนับสนุน
            </p>
            <p className="text-xl font-bold text-foreground">
              {stats.donorCount} คน
            </p>
          </div>
          {nextTierAmount && (
            <div>
              <p className="text-sm font-medium text-foreground/50">เป้าหมาย</p>
              <p className="text-xl font-bold text-foreground">
                ฿{nextTierAmount.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {stats.nextTier && (
        <>
          <div className="mb-1.5 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-foreground/40">
            <span>0%</span>
            <span className="font-medium text-primary">
              {stats.progressPercent}% สู่{" "}
              {stats.nextTier === "seed"
                ? "Seed 🌱"
                : stats.nextTier === "sprout"
                  ? "Sprout 🌿"
                  : stats.nextTier === "bloom"
                    ? "Bloom 🌸"
                    : stats.nextTier === "champion"
                      ? "Champion 🦁"
                      : "Legend 👑"}
            </span>
            <span>100%</span>
          </div>
        </>
      )}

      {!stats.nextTier && (
        <div className="mt-2 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400">
          🎉 ถึง Legend Tier แล้ว! ขอบคุณทุกท่านที่สนับสนุน
        </div>
      )}
    </div>
  );
}

// ─── Tier Card ─────────────────────────────────────────────
function TierCard({
  tier,
  isCurrentOrPast,
  isCurrent,
  currentAmount,
}: {
  tier: RoadMapTierData;
  isCurrentOrPast: boolean;
  isCurrent: boolean;
  currentAmount: number;
}) {
  const style = TIER_STYLE[tier.id];
  const isLegend = tier.id === "legend";

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all",
        "bg-card p-6",
        isLegend
          ? "border-transparent bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 shadow-lg"
          : isCurrent
            ? `border-primary/40 shadow-lg ${style.glow}`
            : isCurrentOrPast
              ? "border-border/60 shadow-sm"
              : "border-border/30 opacity-75",
        isCurrent && "ring-2 ring-primary/30",
        !isCurrentOrPast && !isCurrent && "grayscale-[20%]",
      )}
    >
      {/* "กำลังดำเนินการ" ribbon for current tier */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow">
            <Zap className="h-3 w-3" />
            กำลังดำเนินการอยู่
          </span>
        </div>
      )}

      {/* Legend shimmer ribbon */}
      {isLegend && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent via-primary to-secondary px-3 py-1 text-xs font-semibold text-white shadow">
            <Star className="h-3 w-3" />
            ฝันสูงสุด
          </span>
        </div>
      )}

      {/* Tier header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{tier.emoji}</span>
          <div>
            <h3 className="text-lg font-bold leading-tight">{tier.title}</h3>
            <p className="text-xs text-foreground/50">{tier.subtitle}</p>
          </div>
        </div>

        {tier.targetAmount > 0 && (
          <div
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
              style.badge,
            )}
          >
            ฿{tier.targetAmount.toLocaleString()}
          </div>
        )}
        {tier.targetAmount === 0 && (
          <div className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
            ✅ พร้อมใช้งาน
          </div>
        )}
      </div>

      {/* Features list — dual-track display */}
      <ul className="space-y-3.5">
        {tier.features.map((feat) => (
          <FeatureRow key={feat.id} feat={feat} currentAmount={currentAmount} />
        ))}
      </ul>

      {/* Bottom: note for fully locked tiers */}
      {!isCurrentOrPast && !isCurrent && tier.id !== "free" && (
        <div className="mt-4 rounded-xl border border-dashed border-border/50 bg-muted/50 px-4 py-2.5 text-center text-xs text-foreground/40">
          📅 ฟีเจอร์เหล่านี้มีแผนทำแน่นอน — สนับสนุนช่วย fast-track ได้!
        </div>
      )}
    </div>
  );
}

// ─── Donation CTA Section ──────────────────────────────────
function DonationCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 text-center">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent">
          <Heart className="h-4 w-4 fill-current" />
          ร่วมเป็นส่วนหนึ่งของการเปลี่ยนแปลง
        </div>

        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
          สนับสนุนเพื่อน้องสัตว์
        </h2>

        <p className="mx-auto mb-6 max-w-xl text-sm text-foreground/60 sm:text-base">
          ทุกบาทที่คุณสนับสนุน ช่วยให้เราพัฒนาฟีเจอร์ใหม่ๆ
          เพื่อให้สัตว์จรมีโอกาส
          <br />
          ได้บ้านมากขึ้น — แพลตฟอร์มนี้รันด้วยใจและการสนับสนุนจากคุณ ❤️
        </p>

        {/* Donation amount chips */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {[50, 100, 200, 500, 1000].map((amount) => (
            <Link
              key={amount}
              href={`/donate?amount=${amount}`}
              id={`donate-amount-${amount}`}
              className={cn(
                "rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold transition-all",
                "hover:bg-primary hover:text-white hover:shadow-md active:scale-95",
                "text-primary",
              )}
            >
              ฿{amount}
            </Link>
          ))}
        </div>

        {/* QR Placeholder  */}
        <div className="mx-auto mb-6 flex w-fit flex-col items-center gap-2">
          <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-card text-center text-xs text-foreground/30">
            QR PromptPay
            <br />
            (เร็วๆ นี้)
          </div>
          <p className="text-xs text-foreground/40">
            สแกนผ่าน PromptPay / TrueMoney
          </p>
        </div>

        <p className="text-xs text-foreground/40">
          ✨ ฟีเจอร์สนับสนุนในแอปจะพร้อมใช้เมื่อถึง Champion Tier —
          ฝากติดตามด้วยนะครับ!
        </p>
      </div>
    </section>
  );
}

// ─── Legend / Status Key ───────────────────────────────────
function StatusLegend() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border/40 bg-muted/30 px-5 py-4">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
        วิธีอ่าน Road Map นี้
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Status icons */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-foreground/40">
            สถานะฟีเจอร์
          </p>
          <span className="flex items-center gap-1.5 text-xs text-foreground/60">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Check className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
            </span>
            เสร็จแล้ว — ใช้งานได้ทันที
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground/60">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
            </span>
            กำลังพัฒนาอยู่
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground/60">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted">
              <Lock className="h-2.5 w-2.5 text-foreground/30" />
            </span>
            อยู่ในแผน — รอคิว
          </span>
        </div>

        {/* Dual-track explanation */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-foreground/40">
            ระบบ Dual-track
          </p>
          <span className="flex items-start gap-1.5 text-xs text-foreground/60">
            <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/40" />
            <span>
              <span className="font-semibold text-foreground/70">กำหนดการ</span>
              {" — "}จะทำแน่นอนภายใน quarter นั้น
              <br />
              <span className="text-foreground/40">
                ไม่ว่ายอดสนับสนุนจะถึงหรือไม่
              </span>
            </span>
          </span>
          <span className="flex items-start gap-1.5 text-xs text-foreground/60">
            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              <span className="font-semibold text-primary">Fast-track</span>
              {" — "}ถ้าสนับสนุนถึงเป้า
              <br />
              <span className="text-foreground/40">
                เราเริ่มทำทันที ไม่ต้องรอ deadline!
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────
interface RoadMapViewProps {
  initialViewModel: RoadMapViewModel;
}

export function RoadMapView({ initialViewModel }: RoadMapViewProps) {
  const { tiers, stats } = initialViewModel;

  // Determine which tiers are unlocked based on currentAmount
  const currentAmount = stats.currentAmount;

  const isUnlocked = (tier: RoadMapTierData) =>
    tier.targetAmount === 0 || currentAmount >= tier.targetAmount;

  const isCurrent = (tier: RoadMapTierData) =>
    tier.id === stats.currentTier && tier.id !== "free";

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-10">
      {/* ── Page header ── */}
      <header className="text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Zap className="h-4 w-4" />
          แผนพัฒนาแพลตฟอร์ม
        </div>
        <h1 className="mb-3 text-4xl font-bold sm:text-5xl">Road Map 🐾</h1>
        <p className="mx-auto max-w-lg text-base text-foreground/60">
          ยิ่งชุมชนสนับสนุนมาก — เราพัฒนาฟีเจอร์เด็ดๆ ให้น้องสัตว์มีบ้าน
          <br />
          ได้เร็วขึ้นและมากขึ้น 🚀
        </p>
      </header>

      {/* ── Donation progress ── */}
      <DonationProgress stats={stats} />

      {/* ── Status legend ── */}
      <StatusLegend />

      {/* ── Tier grid ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isCurrentOrPast={isUnlocked(tier)}
            isCurrent={isCurrent(tier)}
            currentAmount={currentAmount}
          />
        ))}
      </div>

      {/* ── Community note ── */}
      <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-muted/40 px-5 py-4">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
        <p className="text-sm text-foreground/60">
          <span className="font-semibold text-foreground">โน้ตจากทีม:</span>{" "}
          ทุกฟีเจอร์ในนี้{" "}
          <span className="font-semibold text-foreground">จะทำแน่นอน</span>{" "}
          ตามกำหนดการที่ระบุไว้ — ไม่มีการล็อคถาวร ไม่มีการบังคับสนับสนุน
          <br />
          แต่ถ้าชุมชนช่วยกัน ยอดถึงเร็ว เราเริ่มทำ{" "}
          <span className="font-semibold text-primary">ทันที</span> โดยไม่ต้องรอ
          deadline ❤️
        </p>
      </div>
    </div>
  );
}
