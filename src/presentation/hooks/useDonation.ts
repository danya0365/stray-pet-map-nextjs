"use client";

import { useState, useEffect, useCallback } from "react";

interface UseDonationOptions {
  autoShowDelay?: number; // ms before auto showing (default: 2 minutes)
  maxAutoShows?: number; // max times to auto show per session (default: 2)
}

interface UseDonationReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  handleDonate: (amount: number, message: string) => Promise<void>;
  triggerAfterAction: () => void;
  hasShown: boolean;
}

const STORAGE_KEY = "straypetmap_donation";

export function useDonation(options: UseDonationOptions = {}): UseDonationReturn {
  const { autoShowDelay = 120000, maxAutoShows = 2 } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

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
      sessionStorage.setItem(
        "donation_auto_shows",
        String(autoShowCount + 1),
      );
    }
  }, [maxAutoShows]);

  const handleDonate = useCallback(
    async (amount: number, message: string) => {
      const res = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          message,
          successUrl: `${window.location.origin}/donate/success`,
          cancelUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await res.json();
      window.location.href = url;
    },
    [],
  );

  return {
    isOpen,
    open,
    close,
    handleDonate,
    triggerAfterAction,
    hasShown,
  };
}
