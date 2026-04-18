"use client";

import type { BadgeProgress, BadgeType } from "@/domain/entities/badge";
import { cn } from "@/presentation/lib/cn";

const BADGE_LABELS: Record<BadgeType, string> = {
  first_post: "โพสต์แรก",
  successful_adoption: "ช่วยหาบ้าน",
  pet_finder: "ตามหาเจ้าของ",
  rescue_hero: "ช่วยแมวจร",
  active_helper: "นักช่วยเหลือ",
  super_helper: "ซูเปอร์ฮีโร่",
  quick_responder: "ตอบเร็ว",
  verified_rescuer: "ยืนยันตัวตน",
  // Comment badges
  first_comment: "เสียงแรก",
  active_commenter: "นักพูดคุยขยัน",
  helpful_responder: "ผู้ให้คำแนะนำ",
  community_connector: "นักเชื่อมโยง",
  comment_streak: "ไม่มีวันหยุด",
  liked_commenter: "คนดังในชุมชน",
};

const TIER_LABELS: Record<string, string> = {
  bronze: "ทองแดง",
  silver: "เงิน",
  gold: "ทอง",
  platinum: "แพลตินัม",
};

interface BadgeProgressBarProps {
  progress: BadgeProgress;
  className?: string;
}

export function BadgeProgressBar({
  progress,
  className,
}: BadgeProgressBarProps) {
  const { type, current, target, percentage, nextTier } = progress;
  const label = BADGE_LABELS[type];
  const nextTierLabel = nextTier ? TIER_LABELS[nextTier] : null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {current} / {target}
          {nextTierLabel && (
            <span className="ml-1 text-primary">({nextTierLabel})</span>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            percentage >= 100 ? "bg-primary" : "bg-primary/60",
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// แสดง progress แบบ card
export function BadgeProgressCard({
  progress,
  className,
}: BadgeProgressBarProps) {
  const { type, current, target, percentage, nextTier } = progress;
  const label = BADGE_LABELS[type];
  const nextTierLabel = nextTier ? TIER_LABELS[nextTier] : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            percentage >= 100
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {percentage}%
        </span>
      </div>

      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            percentage >= 100 ? "bg-primary" : "bg-primary/60",
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {current} / {target}
        </span>
        {nextTierLabel && (
          <span className="text-primary">เป้าหมาย: {nextTierLabel}</span>
        )}
      </div>
    </div>
  );
}
