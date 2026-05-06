"use client";

/**
 * usePetPostLikePresenter
 * Custom hook for single post like button
 * ✅ Uses presenter pattern with repository injection
 * ✅ Follows Clean Architecture pattern
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PetPostLikePresenter } from "./PetPostLikePresenter";
import { createClientPetPostLikePresenter } from "./PetPostLikePresenterClientFactory";

// ── State ────────────────────────────────────────────────

export interface PetPostLikeState {
  isLiked: boolean;
  likeCount: number;
  loading: boolean;
  error: string | null;
}

// ── Actions ──────────────────────────────────────────────

export interface PetPostLikeActions {
  loadStatus: () => Promise<void>;
  toggle: () => Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────

export function usePetPostLikePresenter(
  petPostId: string,
  presenterOverride?: PetPostLikePresenter,
): [PetPostLikeState, PetPostLikeActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientPetPostLikePresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial status
  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await presenter.getLikeStatus(petPostId);

      if (isMountedRef.current) {
        if (result.success && result.data) {
          setIsLiked(result.data.isLiked);
          setLikeCount(result.data.likeCount);
        } else {
          setError(result.error || "Failed to load like status");
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to load like status",
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [presenter, petPostId]);

  // Toggle like
  const toggle = useCallback(async () => {
    // Optimistic update
    const previousIsLiked = isLiked;
    const previousCount = likeCount;
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likeCount + 1 : Math.max(likeCount - 1, 0);

    setIsLiked(newIsLiked);
    setLikeCount(newCount);

    try {
      const result = await presenter.toggleLike(petPostId);

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        setIsLiked(result.data.isLiked);
        if (result.data.isLiked !== newIsLiked) {
          // Reconcile count if server disagrees
          setLikeCount(
            result.data.isLiked ? previousCount + 1 : Math.max(previousCount - 1, 0),
          );
        }
      } else {
        // Rollback on error
        setIsLiked(previousIsLiked);
        setLikeCount(previousCount);
        setError(result.error || "Failed to toggle like");
      }
    } catch (err) {
      if (isMountedRef.current) {
        // Rollback
        setIsLiked(previousIsLiked);
        setLikeCount(previousCount);
        setError(err instanceof Error ? err.message : "Failed to toggle like");
      }
    }
  }, [presenter, petPostId, isLiked, likeCount]);

  // Initial load
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    { isLiked, likeCount, loading, error },
    { loadStatus, toggle },
  ];
}
