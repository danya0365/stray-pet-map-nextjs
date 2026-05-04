"use client";

import type {
  ActivityFeedResult,
  ActivityItem,
} from "@/domain/entities/activity";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActivityFeedPresenter } from "./ActivityFeedPresenter";
import { createClientActivityFeedPresenter } from "./ActivityFeedPresenterClientFactory";

export interface ActivityFeedState {
  items: ActivityItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
  activeFilter: string | null;
}

export interface ActivityFeedActions {
  loadFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: string | null) => void;
  refresh: () => Promise<void>;
}

export function useActivityFeedPresenter(
  initialResult?: ActivityFeedResult,
  presenterOverride?: ActivityFeedPresenter,
): [ActivityFeedState, ActivityFeedActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientActivityFeedPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [items, setItems] = useState<ActivityItem[]>(
    initialResult?.items ?? [],
  );
  const [hasMore, setHasMore] = useState(initialResult?.hasMore ?? false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(
    initialResult?.nextCursor,
  );
  const [loading, setLoading] = useState(!initialResult);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const types = useMemo(
    () => (activeFilter ? [activeFilter] : undefined),
    [activeFilter],
  );

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await presenter.getFeed({ limit: 20, types });
      if (isMountedRef.current) {
        if (result.success && result.data) {
          setItems(result.data.items);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor);
        } else {
          setError(result.error || "Failed to load feed");
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load feed");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [presenter, types]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const result = await presenter.getFeed({
        limit: 20,
        cursor: nextCursor,
        types,
      });
      if (isMountedRef.current) {
        if (result.success && result.data) {
          setItems((prev) => [...prev, ...result.data!.items]);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load more");
      }
    } finally {
      if (isMountedRef.current) setLoadingMore(false);
    }
  }, [presenter, hasMore, nextCursor, loadingMore, types]);

  const setFilter = useCallback((filter: string | null) => {
    setActiveFilter(filter);
  }, []);

  const refresh = useCallback(async () => {
    setNextCursor(undefined);
    await loadFeed();
  }, [loadFeed]);

  // Load on mount (skip if initial data provided)
  useEffect(() => {
    if (!initialResult) {
      loadFeed();
    }
  }, [initialResult, loadFeed]);

  // Reload when filter changes
  useEffect(() => {
    loadFeed();
  }, [activeFilter, loadFeed]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    { items, loading, loadingMore, error, hasMore, nextCursor, activeFilter },
    { loadFeed, loadMore, setFilter, refresh },
  ];
}
