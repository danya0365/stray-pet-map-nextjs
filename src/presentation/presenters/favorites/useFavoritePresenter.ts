"use client";

/**
 * useFavoritePresenter
 * Custom hook for Favorite presenter state management
 * ✅ Uses presenter pattern with API repository injection
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FavoritePresenter, FavoriteViewModel } from "./FavoritePresenter";
import { createClientFavoritePresenter } from "./FavoritePresenterClientFactory";

// ── State ────────────────────────────────────────────────

export interface FavoritePresenterState {
  viewModel: FavoriteViewModel | null;
  loading: boolean;
  error: string | null;
}

// ── Actions ──────────────────────────────────────────────

export interface FavoritePresenterActions {
  loadFavorites: () => Promise<void>;
  checkIsFavorited: (petPostId: string) => Promise<boolean>;
  toggleFavorite: (petPostId: string) => Promise<boolean>;
}

// ── Hook ─────────────────────────────────────────────────

export function useFavoritePresenter(
  initialViewModel?: FavoriteViewModel,
  presenterOverride?: FavoritePresenter,
): [FavoritePresenterState, FavoritePresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientFavoritePresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [viewModel, setViewModel] = useState<FavoriteViewModel | null>(
    initialViewModel || null,
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newViewModel = await presenter.getViewModel();
      if (isMountedRef.current) {
        setViewModel(newViewModel);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [presenter]);

  const checkIsFavorited = useCallback(
    async (petPostId: string): Promise<boolean> => {
      try {
        return await presenter.checkIsFavorited(petPostId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error checking favorite status:", message);
        return false;
      }
    },
    [presenter],
  );

  const toggleFavorite = useCallback(
    async (petPostId: string): Promise<boolean> => {
      try {
        const newState = await presenter.toggleFavorite(petPostId);

        // Update local viewModel if present
        if (isMountedRef.current && viewModel) {
          setViewModel((prev) => {
            if (!prev) return prev;

            const newMap = { ...prev.isFavoritedMap, [petPostId]: newState };

            // If unfavorited, remove from posts list
            let newPosts = prev.posts;
            let newIds = prev.favoriteIds;

            if (!newState) {
              newPosts = prev.posts.filter((p) => p.id !== petPostId);
              newIds = prev.favoriteIds.filter((id) => id !== petPostId);
            }

            return {
              ...prev,
              favoriteIds: newIds,
              posts: newPosts,
              isFavoritedMap: newMap,
            };
          });
        }

        return newState;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (isMountedRef.current) {
          setError(message);
        }
        throw err;
      }
    },
    [presenter, viewModel],
  );

  useEffect(() => {
    if (!initialViewModel) {
      loadFavorites();
    }
  }, [loadFavorites, initialViewModel]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    { viewModel, loading, error },
    { loadFavorites, checkIsFavorited, toggleFavorite },
  ];
}

// ── Single Button Hook (lighter) ───────────────────────

export function useFavoriteButton(petPostId: string): {
  isFavorited: boolean;
  loading: boolean;
  toggle: () => Promise<void>;
} {
  const presenter = useMemo(() => createClientFavoritePresenter(), []);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial state
  useEffect(() => {
    let cancelled = false;
    presenter
      .checkIsFavorited(petPostId)
      .then((result) => {
        if (!cancelled) setIsFavorited(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [presenter, petPostId]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const newState = await presenter.toggleFavorite(petPostId);
      setIsFavorited(newState);
    } finally {
      setLoading(false);
    }
  }, [presenter, petPostId]);

  return { isFavorited, loading, toggle };
}
