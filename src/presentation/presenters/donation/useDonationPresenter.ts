"use client";

/**
 * useDonationPresenter
 * Custom hook for Donation presenter state management
 * ✅ Uses presenter pattern with API repository injection
 */

import { useCallback, useMemo, useRef, useState } from "react";
import type { DonationPresenter } from "./DonationPresenter";
import { createClientDonationPresenter } from "./DonationPresenterClientFactory";
import type {
  DonationLeaderboardEntry,
  DonationStats,
} from "@/domain/entities/donation";

// ── State ────────────────────────────────────────────────

export interface DonationPresenterState {
  leaderboard: DonationLeaderboardEntry[];
  stats: DonationStats | null;
  loading: boolean;
  error: string | null;
}

// ── Actions ──────────────────────────────────────────────

export interface DonationPresenterActions {
  fetchLeaderboard: (type: "weekly" | "alltime") => Promise<void>;
  fetchStats: () => Promise<void>;
  createDonation: (amount: number, message: string) => Promise<void>;
  clearError: () => void;
}

// ── Hook ─────────────────────────────────────────────────

export function useDonationPresenter(
  presenterOverride?: DonationPresenter,
): [DonationPresenterState, DonationPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientDonationPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [leaderboard, setLeaderboard] = useState<DonationLeaderboardEntry[]>(
    [],
  );
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (type: "weekly" | "alltime") => {
      setLoading(true);
      setError(null);

      try {
        const result =
          type === "weekly"
            ? await presenter.getLeaderboardWeekly(10)
            : await presenter.getLeaderboardAllTime(50);

        if (isMountedRef.current) {
          if (result.success && result.data) {
            setLeaderboard(result.data);
          } else {
            setError(result.error || "Failed to fetch leaderboard");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch leaderboard";
          setError(message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await presenter.getStats();

      if (isMountedRef.current) {
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          setError(result.error || "Failed to fetch stats");
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch stats";
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [presenter]);

  const createDonation = useCallback(
    async (amount: number, message: string) => {
      setLoading(true);
      setError(null);

      try {
        // This will redirect to Stripe checkout
        await presenter.create({
          amount,
          message,
          targetType: "fund",
          isAnonymous: false,
          showOnLeaderboard: true,
        });
        // Note: This won't complete due to redirect
      } catch (err) {
        // Redirect error is expected
        if (err instanceof Error && err.message !== "Redirecting to checkout...") {
          if (isMountedRef.current) {
            setError(err.message);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return [
    {
      leaderboard,
      stats,
      loading,
      error,
    },
    {
      fetchLeaderboard,
      fetchStats,
      createDonation,
      clearError,
    },
  ];
}
