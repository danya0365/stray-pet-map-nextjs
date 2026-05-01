"use client";

import type { DonationLeaderboardEntry, DonationStats } from "@/domain/entities/donation";
import { useDonationPresenter } from "./useDonationPresenter";
import { useCallback, useEffect, useState } from "react";

export interface LeaderboardPresenterState {
  activeTab: "weekly" | "alltime";
  entries: DonationLeaderboardEntry[];
  stats: DonationStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface LeaderboardPresenterActions {
  setActiveTab: (tab: "weekly" | "alltime") => void;
  refresh: () => Promise<void>;
}

export function useDonationLeaderboardPresenter(): [
  LeaderboardPresenterState,
  LeaderboardPresenterActions,
] {
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly");
  const [presenterState, presenterActions] = useDonationPresenter();

  const refresh = useCallback(async () => {
    await presenterActions.fetchLeaderboard(activeTab);
    await presenterActions.fetchStats();
  }, [activeTab, presenterActions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return [
    {
      activeTab,
      entries: presenterState.leaderboard,
      stats: presenterState.stats,
      isLoading: presenterState.loading,
      error: presenterState.error,
    },
    { setActiveTab, refresh },
  ];
}
