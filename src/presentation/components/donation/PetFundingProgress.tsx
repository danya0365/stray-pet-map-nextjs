"use client";

import type { PetFundingGoal } from "@/domain/entities/donation";
import { Heart, Target, TrendingUp, Users } from "lucide-react";

interface PetFundingProgressProps {
  goal: PetFundingGoal | null;
  petName: string;
  onDonateClick: () => void;
  enabled?: boolean;
}

export function PetFundingProgress({
  goal,
  petName,
  onDonateClick,
  enabled = true,
}: PetFundingProgressProps) {
  if (!enabled) {
    return null;
  }
  if (!goal) {
    // No active funding goal
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span>น้อง{petName} ยังไม่มีเป้าหมายการสนับสนุน</span>
          </div>
          <button
            onClick={onDonateClick}
            className="text-sm font-medium text-primary hover:underline"
          >
            สนับสนุนให้น้อง
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100,
  );
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const isCompleted = progress >= 100;

  // Calculate days remaining using goal.deadline as stable reference
  // Note: This is calculated at render time
  const now = new Date();
  const daysRemaining = goal.deadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(goal.deadline).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const goalTypeLabels: Record<string, string> = {
    medical: "ค่ารักษาพยาบาล",
    food: "ค่าอาหาร",
    shelter: "ค่าที่พัก",
    transport: "ค่าเดินทาง",
    other: "ค่าใช้จ่ายอื่นๆ",
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-semibold">
              เป้าหมาย{goalTypeLabels[goal.goalType]}ของน้อง
            </div>
            <div className="text-xs text-muted-foreground">
              {isCompleted
                ? "🎉 ครบเป้าหมายแล้ว!"
                : `เหลืออีก ${remaining.toLocaleString()}฿`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? "bg-linear-to-r from-green-500 to-emerald-500"
                : "bg-linear-to-r from-primary to-secondary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>{goal.currentAmount.toLocaleString()}฿ แล้ว</span>
        </div>
        {daysRemaining !== null && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>เหลือ {daysRemaining} วัน</span>
          </div>
        )}
      </div>

      {/* Description (if any) */}
      {goal.description && (
        <div className="mb-3 text-sm text-muted-foreground">
          {goal.description}
        </div>
      )}

      {/* CTA */}
      {!isCompleted && (
        <button
          onClick={onDonateClick}
          className="w-full rounded-xl bg-primary py-2.5 font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2">
            <Heart className="h-4 w-4" />
            ส่งต่อให้ผู้ดูแลน้อง{petName}
          </span>
        </button>
      )}

      {/* Completed Message */}
      {isCompleted && (
        <div className="rounded-xl bg-green-100 p-3 text-center text-sm text-green-700">
          🎉 ขอบคุณผู้สนับสนุนทุกท่าน! น้อง{petName} ครบเป้าหมายแล้ว
        </div>
      )}
    </div>
  );
}
