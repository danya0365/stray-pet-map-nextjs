"use client";

/**
 * useAdoptionRequestPresenter
 * Custom hook for Adoption Request presenter state management
 * ✅ Uses presenter pattern with repository injection
 * ✅ Supports cursor-based pagination for Load More
 * ✅ Follows Clean Architecture pattern
 */

import type { AdoptionRequest } from "@/application/repositories/IAdoptionRequestRepository";
import type { PaginationMode } from "@/domain/types/pagination";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdoptionRequestPresenter } from "./AdoptionRequestPresenter";
import { createClientAdoptionRequestPresenter } from "./AdoptionRequestPresenterClientFactory";

// ============================================================================
// Types
// ============================================================================

export interface AdoptionRequestListState {
  requests: AdoptionRequest[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

export interface AdoptionRequestPresenterState {
  list: AdoptionRequestListState;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface AdoptionRequestPresenterActions {
  loadRequests: (
    petPostId: string,
    pagination?: PaginationMode,
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  createRequest: (payload: {
    petPostId: string;
    message?: string;
    contactPhone?: string;
    contactLineId?: string;
  }) => Promise<boolean>;
  clearSubmitError: () => void;
  hasRequested: (petPostId: string) => Promise<boolean>;
  updateStatus: (
    id: string,
    status: "approved" | "rejected",
  ) => Promise<AdoptionRequest | null>;
}

// ============================================================================
// Hook
// ============================================================================

interface UseAdoptionRequestPresenterProps {
  petPostId?: string;
  initialRequests?: AdoptionRequest[];
}

export function useAdoptionRequestPresenter(
  { petPostId, initialRequests = [] }: UseAdoptionRequestPresenterProps,
  presenterOverride?: AdoptionRequestPresenter,
): [AdoptionRequestPresenterState, AdoptionRequestPresenterActions] {
  // Create presenter with repository via factory
  const presenter = useMemo(
    () => presenterOverride ?? createClientAdoptionRequestPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);
  const currentPetPostIdRef = useRef(petPostId);

  // List state
  const [requests, setRequests] = useState<AdoptionRequest[]>(initialRequests);
  const [totalCount, setTotalCount] = useState(initialRequests.length);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update ref when petPostId changes
  useEffect(() => {
    currentPetPostIdRef.current = petPostId;
  }, [petPostId]);

  // ============================================================================
  // Load Requests
  // ============================================================================

  const loadRequests = useCallback(
    async (targetPetPostId: string, pagination?: PaginationMode) => {
      setLoading(true);
      setListError(null);

      try {
        const paginationOptions: PaginationMode = pagination ?? {
          type: "cursor",
          limit: 20,
        };

        const result = await presenter.getByPostId(
          targetPetPostId,
          paginationOptions,
        );

        if (isMountedRef.current) {
          if (result.success && result.data) {
            setRequests(result.data.data);
            setTotalCount(result.data.total);
            setHasMore(result.data.hasMore);
            setNextCursor(result.data.nextCursor ?? undefined);
          } else {
            setListError(result.error || "Failed to load requests");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setListError(
            err instanceof Error ? err.message : "Failed to load requests",
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

  // Load more requests using cursor pagination
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    if (!currentPetPostIdRef.current) return;

    setLoadingMore(true);

    try {
      const result = await presenter.getByPostId(currentPetPostIdRef.current, {
        type: "cursor",
        cursor: nextCursor,
        limit: 20,
      });

      if (isMountedRef.current) {
        if (result.success && result.data) {
          setRequests((prev) => [...prev, ...result.data!.data]);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor ?? undefined);
        }
      }
    } catch (err) {
      console.error("Error loading more requests:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, nextCursor, loadingMore, presenter]);

  const refreshRequests = useCallback(async () => {
    if (currentPetPostIdRef.current) {
      await loadRequests(currentPetPostIdRef.current);
    }
  }, [loadRequests]);

  // Initial load
  useEffect(() => {
    if (petPostId && initialRequests.length === 0) {
      loadRequests(petPostId);
    }
  }, [petPostId, initialRequests.length, loadRequests]);

  // ============================================================================
  // Create Request
  // ============================================================================

  const createRequest = useCallback(
    async (payload: {
      petPostId: string;
      message?: string;
      contactPhone?: string;
      contactLineId?: string;
    }): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await presenter.create(payload);

        if (isMountedRef.current) {
          if (result.success) {
            // Refresh the list to show the new request
            await refreshRequests();
            return true;
          } else {
            setSubmitError(result.error || "Failed to create request");
            return false;
          }
        }
        return false;
      } catch (err) {
        if (isMountedRef.current) {
          setSubmitError(
            err instanceof Error ? err.message : "Failed to create request",
          );
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [presenter, refreshRequests],
  );

  // ============================================================================
  // Check Has Requested
  // ============================================================================

  const hasRequested = useCallback(
    async (targetPetPostId: string): Promise<boolean> => {
      try {
        const result = await presenter.hasRequested(targetPetPostId);
        if (result.success) {
          return result.hasRequested ?? false;
        }
        return false;
      } catch {
        return false;
      }
    },
    [presenter],
  );

  // ============================================================================
  // Update Status (approve/reject)
  // ============================================================================

  const updateStatus = useCallback(
    async (
      id: string,
      status: "approved" | "rejected",
    ): Promise<AdoptionRequest | null> => {
      try {
        const result = await presenter.updateStatus(id, status);
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    [presenter],
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
        requests,
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
      loadRequests,
      loadMore,
      refreshRequests,
      createRequest,
      clearSubmitError,
      hasRequested,
      updateStatus,
    },
  ];
}
