"use client";

import type { ProfileWithBadges } from "@/domain/entities/badge";
import { cn } from "@/presentation/lib/cn";
import { Medal, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeDisplay } from "./BadgeDisplay";

interface BadgeLeaderboardProps {
  limit?: number;
  className?: string;
}

export function BadgeLeaderboard({
  limit = 10,
  className,
}: BadgeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<ProfileWithBadges[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`/api/badges?limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [limit]);

  if (isLoading) {
    return (
      <div className={cn("flex justify-center py-8", className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className={cn("py-8 text-center text-gray-500", className)}>
        <Trophy className="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>ยังไม่มีข้อมูล Leaderboard</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
          <Trophy className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Hall of Fame</h3>
          <p className="text-sm text-gray-600">นักช่วยเหลือสัตว์ยอดเยี่ยม</p>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((profile, index) => (
          <LeaderboardItem
            key={profile.profileId}
            profile={profile}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

function LeaderboardItem({
  profile,
  rank,
}: {
  profile: ProfileWithBadges;
  rank: number;
}) {
  const rankConfig = {
    1: {
      icon: <Trophy className="h-5 w-5" />,
      color: "bg-yellow-100 text-yellow-700",
    },
    2: {
      icon: <Medal className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-700",
    },
    3: {
      icon: <Medal className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-700",
    },
  };

  const config = rankConfig[rank as keyof typeof rankConfig];

  return (
    <Link href={`/profile/${profile.profileId}`}>
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md">
        {/* Rank */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold",
            config?.color ?? "bg-gray-50 text-gray-600",
          )}
        >
          {config?.icon ?? rank}
        </div>

        {/* Avatar & Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
              👤
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">
              {profile.displayName}
            </p>
            <p className="text-sm text-gray-500">
              {profile.totalBadges} ตราสัญลักษณ์
            </p>
          </div>
        </div>

        {/* Top Badges */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          {profile.recentBadges.slice(0, 3).map((badge) => (
            <BadgeDisplay key={badge.id} badge={badge} size="sm" />
          ))}
        </div>
      </div>
    </Link>
  );
}
