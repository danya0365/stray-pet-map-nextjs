"use client";

/**
 * useFavoritePresenter
 * Custom hook for Favorite presenter state management
 * ✅ Uses presenter pattern with repository injection
 * ✅ Supports cursor-based pagination for Load More
 * ✅ Follows Clean Architecture pattern
 */

import type { PetPost } from "@/domain/entities/pet-post";
import type { PaginationMode } from "@/domain/types/pagination";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FavoritePresenter } from "./FavoritePresenter";
import { createClientFavoritePresenter } from "./FavoritePresenterClientFactory";

// ============================================================================
// Types
// ============================================================================

export interface FavoritesListState {
  posts: PetPost[];
  postIds: string[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

export interface FavoritePresenterState {
  favorites: FavoritesListState;
}

export interface FavoritePresenterActions {
  loadFavorites: (pagination?: PaginationMode) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (petPostId: string) => Promise<boolean>;
}

// ============================================================================
// Hook
// ============================================================================

interface UseFavoritePresenterProps {
  initialPostIds?: string[];
}

export function useFavoritePresenter(
  { initialPostIds = [] }: UseFavoritePresenterProps = {},
  presenterOverride?: FavoritePresenter,
): [FavoritePresenterState, FavoritePresenterActions] {
  // Create presenter with repository via factory
  const presenter = useMemo(
    () => presenterOverride ?? createClientFavoritePresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  // Favorites state
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [postIds, setPostIds] = useState<string[]>(initialPostIds);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Load Favorites
  // ============================================================================

  const loadFavorites = useCallback(
    async (pagination?: PaginationMode) => {
      setLoading(true);
      setError(null);

      try {
        const paginationOptions: PaginationMode = pagination ?? {
          type: "cursor",
          limit: 20,
        };

        const result = await presenter.getFavoritePosts(paginationOptions);

        if (isMountedRef.current) {
          if (result.success) {
            setPosts(result.posts ?? []);
            setPostIds(result.postIds ?? []);
            // Note: getFavoritePosts doesn't return pagination info directly
            // We need to handle pagination differently for favorites
            setTotalCount(result.posts?.length ?? 0);
          } else {
            setError(result.error || "Failed to load favorites");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(
            err instanceof Error ? err.message : "Failed to load favorites",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  // Load more favorites using cursor pagination
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const result = await presenter.getFavoritePosts({
        type: "cursor",
        cursor: nextCursor,
        limit: 20,
      });

      if (isMountedRef.current) {
        if (result.success) {
          setPosts((prev) => [...prev, ...(result.posts ?? [])]);
          setPostIds((prev) => [...prev, ...(result.postIds ?? [])]);
        }
      }
    } catch (err) {
      console.error("Error loading more favorites:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, nextCursor, loadingMore, presenter]);

  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  // Initial load
  useEffect(() => {
    if (initialPostIds.length === 0) {
      loadFavorites();
    }
  }, [initialPostIds.length, loadFavorites]);

  // ============================================================================
  // Toggle Favorite
  // ============================================================================

  const toggleFavorite = useCallback(
    async (petPostId: string): Promise<boolean> => {
      try {
        const result = await presenter.toggleFavorite(petPostId);

        if (isMountedRef.current && result.success) {
          // Update local state to reflect the change
          if (result.isFavorited) {
            // Added to favorites - refresh to get the new item
            await refreshFavorites();
          } else {
            // Removed from favorites - remove from local state
            setPosts((prev) => prev.filter((p) => p.id !== petPostId));
            setPostIds((prev) => prev.filter((id) => id !== petPostId));
          }
          return result.isFavorited ?? false;
        }
        return false;
      } catch (err) {
        console.error("Error toggling favorite:", err);
        return false;
      }
    },
    [presenter, refreshFavorites],
  );

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    {
      favorites: {
        posts,
        postIds,
        totalCount,
        hasMore,
        loading,
        loadingMore,
        error,
      },
    },
    {
      loadFavorites,
      loadMore,
      refreshFavorites,
      toggleFavorite,
    },
  ];
}
