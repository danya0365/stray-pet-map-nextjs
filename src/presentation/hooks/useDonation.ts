"use client";

import type {
  DonationLeaderboardEntry,
  DonationStats,
} from "@/domain/entities/donation";
import { useCallback, useEffect, useState } from "react";

interface UseDonationOptions {
  autoShowDelay?: number; // ms before auto showing (default: 2 minutes)
  maxAutoShows?: number; // max times to auto show per session (default: 2)
}

interface DonationParams {
  amount: number;
  message: string;
  targetType: "pet" | "fund";
  petPostId?: string;
  donorName?: string;
  donorEmail?: string;
  isAnonymous: boolean;
  showOnLeaderboard: boolean;
}

interface LeaderboardData {
  entries: DonationLeaderboardEntry[];
  stats: DonationStats | null;
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
  fetchLeaderboard: (type: "weekly" | "alltime") => Promise<void>;
}

const STORAGE_KEY = "straypetmap_donation";

export function useDonation(
  options: UseDonationOptions = {},
): UseDonationReturn {
  const { autoShowDelay = 120000, maxAutoShows = 2 } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({
    entries: [],
    stats: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        if (data.lastShown === today) {
          setHasShown(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto show after delay (non-intrusive)
  useEffect(() => {
    if (hasShown) return;

    const timer = setTimeout(() => {
      const autoShowCount = parseInt(
        sessionStorage.getItem("donation_auto_shows") || "0",
      );
      if (autoShowCount < maxAutoShows) {
        setIsOpen(true);
        sessionStorage.setItem(
          "donation_auto_shows",
          String(autoShowCount + 1),
        );
      }
    }, autoShowDelay);

    return () => clearTimeout(timer);
  }, [autoShowDelay, maxAutoShows, hasShown]);

  const open = useCallback(() => {
    setIsOpen(true);
    // Mark as shown today
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lastShown: new Date().toDateString() }),
      );
      setHasShown(true);
    } catch {
      // ignore
    }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Trigger after meaningful action (e.g., creating post, earning badge)
  const triggerAfterAction = useCallback(() => {
    const actionCount = parseInt(
      sessionStorage.getItem("donation_action_count") || "0",
    );
    sessionStorage.setItem("donation_action_count", String(actionCount + 1));

    // Show after every 3 meaningful actions (but respect maxAutoShows)
    const autoShowCount = parseInt(
      sessionStorage.getItem("donation_auto_shows") || "0",
    );
    if ((actionCount + 1) % 3 === 0 && autoShowCount < maxAutoShows) {
      setIsOpen(true);
      sessionStorage.setItem("donation_auto_shows", String(autoShowCount + 1));
    }
  }, [maxAutoShows]);

  // Enhanced handleDonate with dual mode support
  const handleDonate = useCallback(async (params: DonationParams) => {
    const res = await fetch("/api/donate/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: params.amount,
        message: params.message,
        targetType: params.targetType,
        petPostId: params.petPostId,
        donorName: params.donorName,
        donorEmail: params.donorEmail,
        isAnonymous: params.isAnonymous,
        showOnLeaderboard: params.showOnLeaderboard,
        successUrl: `${window.location.origin}/donate/success`,
        cancelUrl: window.location.href,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await res.json();
    window.location.href = url;
  }, []);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (type: "weekly" | "alltime") => {
    setIsLoading(true);
    try {
      // For now, use the Supabase client directly or API
      // This is a simplified version - you can enhance with actual API calls
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const viewName =
        type === "weekly"
          ? "donation_leaderboard_weekly"
          : "donation_leaderboard_alltime";

      const { data, error } = await supabase
        .from(viewName)
        .select("*")
        .limit(50);

      if (error) throw error;

      const entries: DonationLeaderboardEntry[] = (data || []).map(
        (d: Record<string, unknown>) => ({
          donorId: (d.donor_id as string) || "guest",
          donorName: (d.donor_name as string) || "ผู้ใจดี",
          avatarUrl: d.avatar_url as string | undefined,
          level: (d.level as number) || 1,
          totalAmount: Number(d.total_amount) || 0,
          donationCount: Number(d.donation_count) || 0,
          lastDonationAt: d.last_donation_at
            ? new Date(d.last_donation_at as string)
            : undefined,
        }),
      );

      // Fetch stats
      const { data: statsData } = await supabase
        .from("donation_stats")
        .select("*")
        .single();

      setLeaderboard({
        entries,
        stats: statsData
          ? {
              totalDonations: Number(statsData.total_donations) || 0,
              monthlyDonations: Number(statsData.monthly_donations) || 0,
              weeklyDonations: Number(statsData.weekly_donations) || 0,
              totalRaised: Number(statsData.total_raised) || 0,
              monthlyRaised: Number(statsData.monthly_raised) || 0,
              weeklyRaised: Number(statsData.weekly_raised) || 0,
              uniqueDonors: Number(statsData.unique_donors) || 0,
            }
          : null,
      });
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isOpen,
    open,
    close,
    handleDonate,
    triggerAfterAction,
    hasShown,
    leaderboard,
    isLoading,
    fetchLeaderboard,
  };
}
