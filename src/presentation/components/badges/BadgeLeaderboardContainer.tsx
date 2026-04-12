"use client";

import type { ProfileWithBadges } from "@/domain/entities/badge";
import { useEffect, useState } from "react";
import { BadgeLeaderboardView } from "./BadgeLeaderboardView";

interface BadgeLeaderboardContainerProps {
  limit?: number;
}

export function BadgeLeaderboardContainer({
  limit = 10,
}: BadgeLeaderboardContainerProps) {
  const [leaderboard, setLeaderboard] = useState<ProfileWithBadges[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/badges?limit=${limit}`);

        if (!res.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [limit]);

  return (
    <BadgeLeaderboardView
      leaderboard={leaderboard}
      isLoading={isLoading}
      error={error}
    />
  );
}
