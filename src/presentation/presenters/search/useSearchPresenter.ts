"use client";

import type {
  NearByFilter,
  PetPostFilters,
  PetPostSortField,
  SortOrder,
} from "@/application/repositories/IPetPostRepository";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SearchParams,
  SearchPresenter,
  SearchViewModel,
} from "./SearchPresenter";
import { createClientSearchPresenter } from "./SearchPresenterClientFactory";

export interface SearchPresenterState {
  viewModel: SearchViewModel | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  currentPage: number;
  nearBy: NearByFilter | undefined;
}

export interface SearchPresenterActions {
  search: (text: string) => void;
  setFilters: (filters: PetPostFilters) => void;
  setNearBy: (nearBy: NearByFilter | undefined) => void;
  setSortBy: (sortBy: PetPostSortField) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useSearchPresenter(
  initialViewModel?: SearchViewModel,
  presenterOverride?: SearchPresenter,
): [SearchPresenterState, SearchPresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientSearchPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [viewModel, setViewModel] = useState<SearchViewModel | null>(
    initialViewModel || null,
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchText, setSearchText] = useState(initialViewModel?.search || "");
  const [filters, setFiltersState] = useState<PetPostFilters>(
    initialViewModel?.filters || {},
  );
  const [sortBy, setSortByState] = useState<PetPostSortField>(
    initialViewModel?.sortBy || "createdAt",
  );
  const [sortOrder, setSortOrderState] = useState<SortOrder>(
    initialViewModel?.sortOrder || "desc",
  );
  const [nearBy, setNearByState] = useState<NearByFilter | undefined>();

  const fetchData = useCallback(
    async (params: SearchParams) => {
      setLoading(true);
      setError(null);
      setCurrentPage(params.page || 1);

      try {
        const result = await presenter.getViewModel(params);
        if (isMountedRef.current) {
          setViewModel(result);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  const searchAction = useCallback(
    (text: string) => {
      setSearchText(text);
      fetchData({ filters, search: text, nearBy, sortBy, sortOrder, page: 1 });
    },
    [filters, nearBy, sortBy, sortOrder, fetchData],
  );

  const setFilters = useCallback(
    (newFilters: PetPostFilters) => {
      setFiltersState(newFilters);
      fetchData({
        filters: newFilters,
        search: searchText,
        nearBy,
        sortBy,
        sortOrder,
        page: 1,
      });
    },
    [searchText, nearBy, sortBy, sortOrder, fetchData],
  );

  const setNearBy = useCallback(
    (newNearBy: NearByFilter | undefined) => {
      setNearByState(newNearBy);
      fetchData({
        filters,
        search: searchText,
        nearBy: newNearBy,
        sortBy: newNearBy ? "distance" : "createdAt",
        sortOrder: newNearBy ? "asc" : "desc",
        page: 1,
      });
    },
    [filters, searchText, fetchData],
  );

  const setSortBy = useCallback(
    (newSortBy: PetPostSortField) => {
      setSortByState(newSortBy);
      fetchData({
        filters,
        search: searchText,
        nearBy,
        sortBy: newSortBy,
        sortOrder,
        page: 1,
      });
    },
    [filters, searchText, nearBy, sortOrder, fetchData],
  );

  const setSortOrder = useCallback(
    (newSortOrder: SortOrder) => {
      setSortOrderState(newSortOrder);
      fetchData({
        filters,
        search: searchText,
        nearBy,
        sortBy,
        sortOrder: newSortOrder,
        page: 1,
      });
    },
    [filters, searchText, nearBy, sortBy, fetchData],
  );

  const loadMore = useCallback(async () => {
    if (!viewModel?.result.hasMore || loadingMore) return;

    const nextPage = currentPage + 1;
    setLoadingMore(true);

    try {
      const result = await presenter.loadMore({
        filters,
        search: searchText,
        nearBy,
        sortBy,
        sortOrder,
        page: nextPage,
      });

      if (isMountedRef.current) {
        setViewModel((prev) =>
          prev
            ? {
                ...prev,
                result: {
                  ...result,
                  data: [...prev.result.data, ...result.data],
                },
              }
            : prev,
        );
        setCurrentPage(nextPage);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [
    viewModel,
    loadingMore,
    currentPage,
    presenter,
    filters,
    searchText,
    nearBy,
    sortBy,
    sortOrder,
  ]);

  const reset = useCallback(() => {
    setSearchText("");
    setFiltersState({});
    setNearByState(undefined);
    setSortByState("createdAt");
    setSortOrderState("desc");
    fetchData({ page: 1 });
  }, [fetchData]);

  useEffect(() => {
    if (!initialViewModel) {
      fetchData({ filters, search: searchText, sortBy, sortOrder, page: 1 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    { viewModel, loading, loadingMore, error, currentPage, nearBy },
    {
      search: searchAction,
      setFilters,
      setNearBy,
      setSortBy,
      setSortOrder,
      loadMore,
      reset,
    },
  ];
}
