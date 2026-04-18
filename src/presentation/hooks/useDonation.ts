"use client";

/**
 * useDonation
 * Wrapper hook that combines donation UI state with presenter pattern
 * ✅ Uses useDonationPresenter for data operations
 * ✅ Uses Zustand donationStore for UI state (persisted)
 */

import { useDonationStore } from "@/application/stores/donationStore";
import {
  type DonationPresenterState,
  useDonationPresenter,
} from "@/presentation/presenters/donation/useDonationPresenter";
import { useCallback, useEffect } from "react";

interface UseDonationOptions {
  autoShowDelay?: number; // ms before auto showing (default: 2 minutes)
  maxAutoShows?: number; // max times to auto show per session (default: 2)
}

interface DonationParams {
  amount: number;
  message: string;
  targetType: "pet" | "fund" | "dev";
  petPostId?: string;
  donorName?: string;
  donorEmail?: string;
  isAnonymous: boolean;
  showOnLeaderboard: boolean;
}

interface LeaderboardData {
  entries: DonationPresenterState["leaderboard"];
  stats: DonationPresenterState["stats"];
}

interface UseDonationReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  handleDonate: (params: DonationParams) => Promise<void>;
  triggerAfterAction: () => void;
  hasShown: boolean;
  // Leaderboard
  leaderboard: LeaderboardData;
  isLoading: boolean;
  error: string | null;
  fetchLeaderboard: (type: "weekly" | "alltime") => Promise<void>;
}

export function useDonation(
  options: UseDonationOptions = {},
): UseDonationReturn {
  const { autoShowDelay = 120000, maxAutoShows = 2 } = options;

  // UI State (from Zustand store)
  const {
    isOpen,
    hasShown,
    autoShowCount,
    open: storeOpen,
    close,
    incrementAutoShowCount,
    incrementActionCount,
  } = useDonationStore();

  // Presenter state & actions (data operations)
  const [presenterState, presenterActions] = useDonationPresenter();

  // Auto show after delay (non-intrusive)
  useEffect(() => {
    if (hasShown) return;

    const timer = setTimeout(() => {
      if (autoShowCount < maxAutoShows) {
        storeOpen();
        incrementAutoShowCount();
      }
    }, autoShowDelay);

    return () => clearTimeout(timer);
  }, [
    autoShowDelay,
    maxAutoShows,
    hasShown,
    autoShowCount,
    storeOpen,
    incrementAutoShowCount,
  ]);

  const open = useCallback(() => {
    storeOpen();
  }, [storeOpen]);

  // Trigger after meaningful action (e.g., creating post, earning badge)
  const triggerAfterAction = useCallback(() => {
    incrementActionCount();
    const { actionCount, autoShowCount: currentAutoShowCount } =
      useDonationStore.getState();

    // Show after every 3 meaningful actions (but respect maxAutoShows)
    if (actionCount % 3 === 0 && currentAutoShowCount < maxAutoShows) {
      storeOpen();
      incrementAutoShowCount();
    }
  }, [incrementActionCount, incrementAutoShowCount, maxAutoShows, storeOpen]);

  // Handle donation - uses presenter
  const handleDonate = useCallback(
    async (params: DonationParams) => {
      await presenterActions.createDonation(params.amount, params.message);
    },
    [presenterActions],
  );

  // Fetch leaderboard - uses presenter
  const fetchLeaderboard = useCallback(
    async (type: "weekly" | "alltime") => {
      await presenterActions.fetchLeaderboard(type);
      // Also fetch stats
      await presenterActions.fetchStats();
    },
    [presenterActions],
  );

  // Combined loading state
  const isLoading = presenterState.loading;

  // Combined leaderboard data
  const leaderboard: LeaderboardData = {
    entries: presenterState.leaderboard,
    stats: presenterState.stats,
  };

  return {
    isOpen,
    open,
    close,
    handleDonate,
    triggerAfterAction,
    hasShown,
    leaderboard,
    isLoading,
    error: presenterState.error,
    fetchLeaderboard,
  };
}
