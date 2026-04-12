"use client";

import { useEffect, useState } from "react";
import type { ProfileWithBadges } from "@/domain/entities/badge";
import { BadgeDisplay } from "./BadgeDisplay";
import { Trophy, Medal, Award, ChevronRight } from "lucide-react";
import { cn } from "@/presentation/lib/cn";
import Link from "next/link";

interface BadgeHomeSectionProps {
  limit?: number;
}

export function BadgeHomeSection({ limit = 5 }: BadgeHomeSectionProps) {
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
      <section className="border-t border-border/40 bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  if (leaderboard.length === 0) return null;

  return (
    <section className="border-t border-border/40 bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">Hall of Fame</h2>
          </div>
          <Link
            href="/badges"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ดูทั้งหมด
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Leaderboard Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leaderboard.map((profile, index) => (
            <LeaderboardCard key={profile.profileId} profile={profile} rank={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LeaderboardCard({
  profile,
  rank,
}: {
  profile: ProfileWithBadges;
  rank: number;
}) {
  const rankConfig = {
    1: { icon: <Trophy className="h-4 w-4" />, bg: "bg-amber-100 text-amber-700" },
    2: { icon: <Medal className="h-4 w-4" />, bg: "bg-gray-100 text-gray-700" },
    3: { icon: <Medal className="h-4 w-4" />, bg: "bg-orange-100 text-orange-700" },
  };

  const config = rankConfig[rank as keyof typeof rankConfig];

  return (
    <Link href={`/profile/${profile.profileId}`}>
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-4 transition-all hover:shadow-md">
        {/* Rank */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm",
            config?.bg ?? "bg-muted text-muted-foreground"
          )}
        >
          {config?.icon ?? rank}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{profile.displayName}</p>
          <p className="text-xs text-muted-foreground">
            <Award className="mr-1 inline h-3 w-3" />
            {profile.totalBadges} ตราสัญลักษณ์
          </p>
        </div>

        {/* Badges */}
        <div className="flex shrink-0 items-center gap-1">
          {profile.recentBadges.slice(0, 3).map((badge) => (
            <BadgeDisplay key={badge.id} badge={badge} size="sm" showTooltip={false} />
          ))}
        </div>
      </div>
    </Link>
  );
}
