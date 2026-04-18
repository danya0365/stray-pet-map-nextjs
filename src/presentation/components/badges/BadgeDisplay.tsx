"use client";

import type { Badge, BadgeTier } from "@/domain/entities/badge";
import { cn } from "@/presentation/lib/cn";

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const tierConfig: Record<BadgeTier, { label: string; border: string }> = {
  bronze: { label: "ทองแดง", border: "border-amber-600" },
  silver: { label: "เงิน", border: "border-gray-400" },
  gold: { label: "ทอง", border: "border-yellow-500" },
  platinum: { label: "แพลตินัม", border: "border-cyan-500" },
};

export function BadgeDisplay({
  badge,
  size = "md",
  showTooltip = true,
}: BadgeDisplayProps) {
  const tier = tierConfig[badge.tier];

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <div className="group relative">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 bg-white shadow-sm transition-all",
          "hover:scale-110 hover:shadow-md",
          sizeClasses[size],
          tier.border,
          badge.color,
        )}
        title={showTooltip ? `${badge.name} (${tier.label})` : undefined}
      >
        {badge.icon}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-lg bg-gray-900 px-3 py-2 text-center text-sm text-white shadow-lg">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-xs text-gray-300">{tier.label}</p>
            {badge.earnedValue && (
              <p className="mt-1 text-xs text-gray-400">
                ทำได้ {badge.earnedValue} ครั้ง
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">{badge.description}</p>
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// Badge แบบกะทัดรัด (สำหรับแสดงใน list)
export function BadgeCompact({ badge }: { badge: Badge }) {
  const tier = tierConfig[badge.tier];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5",
        badge.color,
      )}
    >
      <span className="text-lg">{badge.icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-medium leading-tight">{badge.name}</span>
        <span className="text-[10px] leading-tight opacity-75">
          {tier.label}
        </span>
      </div>
    </div>
  );
}
