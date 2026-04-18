"use client";

import type { ProfileWithBadges } from "@/domain/entities/badge";
import { cn } from "@/presentation/lib/cn";
import { Award, Loader2, Medal, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BadgeDisplay } from "./BadgeDisplay";

interface BadgeLeaderboardViewProps {
  leaderboard: ProfileWithBadges[];
  isLoading: boolean;
  error: string | null;
}

export function BadgeLeaderboardView({
  leaderboard,
  isLoading,
  error,
}: BadgeLeaderboardViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy className="h-12 w-12 text-foreground/20" />
        <p className="mt-3 text-sm font-medium text-foreground/60">
          ยังไม่มีข้อมูล Hall of Fame
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          เริ่มต้นช่วยเหลือสัตว์เพื่อขึ้นอันดับ!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {leaderboard.map((profile, index) => (
        <LeaderboardItem
          key={profile.profileId}
          profile={profile}
          rank={index + 1}
        />
      ))}
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
      color:
        "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-200",
      label: "🥇 อันดับ 1",
    },
    2: {
      icon: <Medal className="h-5 w-5" />,
      color:
        "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-lg shadow-gray-200",
      label: "🥈 อันดับ 2",
    },
    3: {
      icon: <Medal className="h-5 w-5" />,
      color:
        "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-200",
      label: "🥉 อันดับ 3",
    },
  };

  const config = rankConfig[rank as keyof typeof rankConfig];

  return (
    <Link href={`/profile/${profile.profileId}`}>
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md",
          rank <= 3 && "border-primary/20",
        )}
      >
        {/* Rank Badge */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold",
            config?.color ?? "bg-muted text-muted-foreground",
          )}
        >
          {config?.icon ?? rank}
        </div>

        {/* Avatar & Info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {profile.avatarUrl && profile.avatarUrl.startsWith("http") ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-xl">
              👤
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{profile.displayName}</p>
            <p className="text-sm text-muted-foreground">
              <Award className="mr-1 inline h-3.5 w-3.5" />
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
