"use client";

/**
 * usePublicProfilePresenter
 * Custom hook for Public Profile presenter state management
 * ✅ Uses presenter pattern with repository injection
 * ✅ Supports cursor-based pagination for Load More
 * ✅ Follows Clean Architecture pattern
 */

import type { PetPost } from "@/domain/entities/pet-post";
import type { PaginationMode } from "@/application/repositories/IPetPostRepository";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicProfilePresenter } from "./PublicProfilePresenter";
import { createClientPublicProfilePresenter } from "./PublicProfilePresenterClientFactory";

// ============================================================================
// Types
// ============================================================================

export interface PublicProfilePostsState {
  posts: PetPost[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

export interface PublicProfilePresenterState {
  posts: PublicProfilePostsState;
}

export interface PublicProfilePresenterActions {
  loadPosts: (profileId: string, pagination?: PaginationMode) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshPosts: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

interface UsePublicProfilePresenterProps {
  profileId?: string;
  initialPosts?: PetPost[];
}

export function usePublicProfilePresenter(
  { profileId, initialPosts = [] }: UsePublicProfilePresenterProps,
  presenterOverride?: PublicProfilePresenter,
): [PublicProfilePresenterState, PublicProfilePresenterActions] {
  // Create presenter with repository via factory
  const presenter = useMemo(
    () => presenterOverride ?? createClientPublicProfilePresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);
  const currentProfileIdRef = useRef(profileId);

  // Posts state
  const [posts, setPosts] = useState<PetPost[]>(initialPosts);
  const [totalCount, setTotalCount] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update ref when profileId changes
  useEffect(() => {
    currentProfileIdRef.current = profileId;
  }, [profileId]);

  // ============================================================================
  // Load Posts
  // ============================================================================

  const loadPosts = useCallback(
    async (targetProfileId: string, pagination?: PaginationMode) => {
      setLoading(true);
      setError(null);

      try {
        const paginationOptions: PaginationMode = pagination ?? {
          type: "cursor",
          limit: 20,
        };

        const result = await presenter.getPosts(
          targetProfileId,
          paginationOptions,
        );

        if (isMountedRef.current) {
          if (result.success && result.data) {
            setPosts(result.data.posts);
            setTotalCount(result.data.total);
            setHasMore(result.data.hasMore);
            setNextCursor(result.data.nextCursor ?? undefined);
          } else {
            setError(result.error || "Failed to load posts");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(
            err instanceof Error ? err.message : "Failed to load posts",
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

  // Load more posts using cursor pagination
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    if (!currentProfileIdRef.current) return;

    setLoadingMore(true);

    try {
      const result = await presenter.getPosts(
        currentProfileIdRef.current,
        {
          type: "cursor",
          cursor: nextCursor,
          limit: 20,
        },
      );

      if (isMountedRef.current) {
        if (result.success && result.data) {
          setPosts((prev) => [...prev, ...result.data!.posts]);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor ?? undefined);
        }
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, nextCursor, loadingMore, presenter]);

  const refreshPosts = useCallback(async () => {
    if (currentProfileIdRef.current) {
      await loadPosts(currentProfileIdRef.current);
    }
  }, [loadPosts]);

  // Initial load
  useEffect(() => {
    if (profileId && initialPosts.length === 0) {
      loadPosts(profileId);
    }
  }, [profileId, initialPosts.length, loadPosts]);

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
      posts: {
        posts,
        totalCount,
        hasMore,
        loading,
        loadingMore,
        error,
      },
    },
    {
      loadPosts,
      loadMore,
      refreshPosts,
    },
  ];
}
