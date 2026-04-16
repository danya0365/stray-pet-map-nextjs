"use client";

import type { Badge, BadgeProgress } from "@/domain/entities/badge";
import { cn } from "@/presentation/lib/cn";
import { Award, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { BadgeCompact, BadgeDisplay } from "./BadgeDisplay";
import { BadgeProgressBar } from "./BadgeProgress";

interface BadgeSectionProps {
  profileId?: string; // ถ้าไม่ระบุจะดึงข้อมูลของผู้ใช้ปัจจุบัน
  showProgress?: boolean;
  className?: string;
}

interface BadgeData {
  badges: Badge[];
  totalBadges: number;
  progress: BadgeProgress[];
}

export function BadgeSection({
  profileId,
  showProgress = true,
  className,
}: BadgeSectionProps) {
  const [data, setData] = useState<BadgeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        setIsLoading(true);
        const url = profileId
          ? `/api/badges/profile/${profileId}`
          : "/api/badges/profile";
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Failed to fetch badges");
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadges();
  }, [profileId]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={cn("py-8 text-center text-gray-500", className)}>
        <Award className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p className="text-sm">ยังไม่มีตราสัญลักษณ์</p>
      </div>
    );
  }

  const { badges, totalBadges, progress } = data;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <Award className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">ตราสัญลักษณ์</h3>
          <p className="text-sm text-gray-600">ได้รับแล้ว {totalBadges} อัน</p>
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {badges.map((badge) => (
            <BadgeDisplay key={badge.id} badge={badge} size="md" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            เริ่มต้นช่วยเหลือสัตว์เพื่อรับตราสัญลักษณ์แรกของคุณ!
          </p>
        </div>
      )}

      {/* Progress Section */}
      {showProgress && progress.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">ความคืบหน้า</h4>
          <div className="grid gap-3">
            {progress.map((p) => (
              <BadgeProgressBar key={p.type} progress={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version สำหรับแสดงใน card/profile
export function BadgeSectionCompact({
  profileId,
  className,
}: {
  profileId?: string;
  className?: string;
}) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const url = profileId
          ? `/api/badges/profile/${profileId}`
          : "/api/badges/profile";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges.slice(0, 3)); // แสดงแค่ 3 อันแรก
        }
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadges();
  }, [profileId]);

  if (isLoading) {
    return (
      <div className={cn("flex gap-2", className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-6 w-6 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge) => (
        <BadgeCompact key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
