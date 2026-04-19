"use client";

/**
 * useReportPresenter
 * Custom hook for Report presenter state management
 * ✅ Uses presenter pattern with repository injection
 * ✅ Supports cursor-based pagination for Load More
 * ✅ Follows Clean Architecture pattern
 */

import type { PaginationMode } from "@/application/repositories/IPetPostRepository";
import type { Report } from "@/application/repositories/IReportRepository";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReportPresenter } from "./ReportPresenter";
import { createClientReportPresenter } from "./ReportPresenterClientFactory";

// ============================================================================
// Types
// ============================================================================

export interface ReportsListState {
  reports: Report[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

export interface ReportPresenterState {
  list: ReportsListState;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface ReportPresenterActions {
  loadReports: (pagination?: PaginationMode) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshReports: () => Promise<void>;
  createReport: (payload: {
    petPostId: string;
    reason: "spam" | "fake_info" | "inappropriate" | "animal_abuse" | "other";
    description?: string;
  }) => Promise<boolean>;
  clearSubmitError: () => void;
}

// ============================================================================
// Hook
// ============================================================================

interface UseReportPresenterProps {
  initialReports?: Report[];
}

export function useReportPresenter(
  { initialReports = [] }: UseReportPresenterProps = {},
  presenterOverride?: ReportPresenter,
): [ReportPresenterState, ReportPresenterActions] {
  // Create presenter with repository via factory
  const presenter = useMemo(
    () => presenterOverride ?? createClientReportPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  // List state
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [totalCount, setTotalCount] = useState(initialReports.length);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ============================================================================
  // Load Reports
  // ============================================================================

  const loadReports = useCallback(
    async (pagination?: PaginationMode) => {
      setLoading(true);
      setListError(null);

      try {
        const paginationOptions: PaginationMode = pagination ?? {
          type: "cursor",
          limit: 20,
        };

        const result = await presenter.getMyReports(paginationOptions);

        if (isMountedRef.current) {
          if (result.success && result.data) {
            setReports(result.data.data);
            setTotalCount(result.data.total);
            setHasMore(result.data.hasMore);
            setNextCursor(result.data.nextCursor ?? undefined);
          } else {
            setListError(result.error || "Failed to load reports");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setListError(
            err instanceof Error ? err.message : "Failed to load reports",
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

  // Load more reports using cursor pagination
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const result = await presenter.getMyReports({
        type: "cursor",
        cursor: nextCursor,
        limit: 20,
      });

      if (isMountedRef.current) {
        if (result.success && result.data) {
          setReports((prev) => [...prev, ...result.data!.data]);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor ?? undefined);
        }
      }
    } catch (err) {
      console.error("Error loading more reports:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, nextCursor, loadingMore, presenter]);

  const refreshReports = useCallback(async () => {
    await loadReports();
  }, [loadReports]);

  // Initial load
  useEffect(() => {
    if (initialReports.length === 0) {
      loadReports();
    }
  }, [initialReports.length, loadReports]);

  // ============================================================================
  // Create Report
  // ============================================================================

  const createReport = useCallback(
    async (payload: {
      petPostId: string;
      reason: "spam" | "fake_info" | "inappropriate" | "animal_abuse" | "other";
      description?: string;
    }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await presenter.create(payload);

        if (isMountedRef.current) {
          if (result.success) {
            // Refresh the list to show the new report
            await refreshReports();
            return true;
          } else {
            setSubmitError(result.error || "Failed to create report");
            return false;
          }
        }
        return false;
      } catch (err) {
        if (isMountedRef.current) {
          setSubmitError(
            err instanceof Error ? err.message : "Failed to create report",
          );
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [presenter, refreshReports],
  );

  // ============================================================================
  // UI Actions
  // ============================================================================

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

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
      list: {
        reports,
        totalCount,
        hasMore,
        loading,
        loadingMore,
        error: listError,
      },
      isSubmitting,
      submitError,
    },
    {
      loadReports,
      loadMore,
      refreshReports,
      createReport,
      clearSubmitError,
    },
  ];
}
