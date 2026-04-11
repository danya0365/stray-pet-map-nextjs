"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapViewModel, MapPresenter } from "./MapPresenter";
import type { PetPostFilters } from "@/application/repositories/IPetPostRepository";
import type { PetPost } from "@/domain/entities/pet-post";
import { createClientMapPresenter } from "./MapPresenterClientFactory";

export interface MapPresenterState {
  viewModel: MapViewModel | null;
  loading: boolean;
  error: string | null;
  selectedPost: PetPost | null;
  filters: PetPostFilters;
}

export interface MapPresenterActions {
  loadData: () => Promise<void>;
  loadMore: () => Promise<void>;
  selectPost: (post: PetPost | null) => void;
  setFilters: (filters: PetPostFilters) => void;
  setError: (error: string | null) => void;
}

export function useMapPresenter(
  initialViewModel?: MapViewModel,
  presenterOverride?: MapPresenter,
): [MapPresenterState, MapPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientMapPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [viewModel, setViewModel] = useState<MapViewModel | null>(
    initialViewModel || null,
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null);
  const [filters, setFilters] = useState<PetPostFilters>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newViewModel = await presenter.getViewModel(filters);
      if (isMountedRef.current) {
        setViewModel(newViewModel);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [presenter, filters]);

  const loadMore = useCallback(async () => {
    if (!viewModel?.nextCursor || !viewModel.hasMore) return;

    try {
      const result = await presenter.loadMore(viewModel.nextCursor, filters);
      if (isMountedRef.current) {
        setViewModel((prev) =>
          prev
            ? {
                ...prev,
                posts: [...prev.posts, ...result.data],
                hasMore: result.hasMore ?? false,
                nextCursor: result.nextCursor,
              }
            : prev,
        );
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      }
    }
  }, [presenter, viewModel, filters]);

  const selectPost = useCallback((post: PetPost | null) => {
    setSelectedPost(post);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    { viewModel, loading, error, selectedPost, filters },
    { loadData, loadMore, selectPost, setFilters, setError },
  ];
}
