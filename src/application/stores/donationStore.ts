"use client";

/**
 * donationStore
 * Zustand store for donation UI state with persistence
 * ✅ Uses zustand persist for localStorage
 * ✅ Separates UI state from data operations
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DonationUIState {
  isOpen: boolean;
  hasShown: boolean;
  actionCount: number;
  autoShowCount: number;

  // Actions
  open: () => void;
  close: () => void;
  markShown: () => void;
  incrementActionCount: () => void;
  incrementAutoShowCount: () => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  hasShown: false,
  actionCount: 0,
  autoShowCount: 0,
};

export const useDonationStore = create<DonationUIState>()(
  persist(
    (set) => ({
      ...initialState,

      open: () =>
        set((state) => ({
          isOpen: true,
          hasShown: true,
        })),

      close: () => set({ isOpen: false }),

      markShown: () =>
        set({
          hasShown: true,
        }),

      incrementActionCount: () =>
        set((state) => ({
          actionCount: state.actionCount + 1,
        })),

      incrementAutoShowCount: () =>
        set((state) => ({
          autoShowCount: state.autoShowCount + 1,
        })),

      reset: () => set(initialState),
    }),
    {
      name: "straypetmap-donation",
      // Only persist these fields
      partialize: (state) => ({
        hasShown: state.hasShown,
        actionCount: state.actionCount,
        autoShowCount: state.autoShowCount,
      }),
    },
  ),
);
