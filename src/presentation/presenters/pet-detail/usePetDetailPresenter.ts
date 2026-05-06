"use client";

/**
 * usePetDetailPresenter
 * Custom hook for PetDetail presenter state management
 * ✅ Uses presenter pattern with API repository injection via factory
 * ✅ Follows Clean Architecture pattern
 */

import type { AdoptionRequest } from "@/application/repositories/IAdoptionRequestRepository";
import type { PetFundingGoal } from "@/domain/entities/donation";
import type { PetPostOutcome } from "@/domain/entities/pet-post";
import { useAdoptionRequestPresenter } from "@/presentation/presenters/adoption-request/useAdoptionRequestPresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PetDetailPresenter,
  PetDetailViewModel,
} from "./PetDetailPresenter";
import { createClientPetDetailPresenter } from "./PetDetailPresenterClientFactory";

// ── State ────────────────────────────────────────────────

export interface PetDetailPresenterState {
  viewModel: PetDetailViewModel | null;
  loading: boolean;
  error: string | null;
  isOwner: boolean;
  canClose: boolean;
  isAdoptionModalOpen: boolean;
  isCloseModalOpen: boolean;
  isClosingPost: boolean;
  fundingGoal: PetFundingGoal | null;
  isLoadingFundingGoal: boolean;
  hasRequested: boolean;
  isLoadingHasRequested: boolean;
  adoptionRequests: AdoptionRequest[];
  adoptionRequestsTotal: number;
  adoptionRequestsLoading: boolean;
  processingRequestId: string | null;
}

// ── Actions ──────────────────────────────────────────────

export interface PetDetailPresenterActions {
  loadPet: (id: string) => Promise<void>;
  clearError: () => void;
  openAdoptionModal: () => void;
  closeAdoptionModal: () => void;
  openCloseModal: () => void;
  closeCloseModal: () => void;
  handleAdoptClick: () => void;
  handleClosePost: (outcome: PetPostOutcome) => Promise<void>;
  fetchFundingGoal: (petPostId: string) => Promise<void>;
  handleApproveRequest: (id: string) => Promise<void>;
  handleRejectRequest: (id: string) => Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────

interface UsePetDetailPresenterProps {
  initialViewModel?: PetDetailViewModel;
}

export function usePetDetailPresenter(
  { initialViewModel }: UsePetDetailPresenterProps = {},
  presenterOverride?: PetDetailPresenter,
): [PetDetailPresenterState, PetDetailPresenterActions] {
  const router = useRouter();
  const { user } = useAuthStore();

  // Create presenter with repository via factory
  const presenter = useMemo(
    () => presenterOverride ?? createClientPetDetailPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);

  const [viewModel, setViewModel] = useState<PetDetailViewModel | null>(
    initialViewModel ?? null,
  );
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);

  // UI Modal states
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isClosingPost, setIsClosingPost] = useState(false);
  const [fundingGoal, setFundingGoal] = useState<PetFundingGoal | null>(null);
  const [isLoadingFundingGoal, setIsLoadingFundingGoal] = useState(false);

  // ── Adoption Request Sub-Presenter ──────────────────────
  const [adoptionState, adoptionActions] = useAdoptionRequestPresenter({
    petPostId: viewModel?.post.id,
  });

  // Adoption states exposed
  const adoptionRequests = adoptionState.list.requests;
  const adoptionRequestsTotal = adoptionState.list.totalCount;
  const adoptionRequestsLoading = adoptionState.list.loading;

  // hasRequested check for non-owner
  const [hasRequested, setHasRequested] = useState(false);
  const [isLoadingHasRequested, setIsLoadingHasRequested] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null,
  );

  // Computed states
  const isOwner = useMemo(() => {
    if (!user?.id || !viewModel?.post.profileId) return false;
    return user.id === viewModel.post.profileId;
  }, [user?.id, viewModel?.post.profileId]);

  const canClose = useMemo(() => {
    if (!viewModel?.post) return false;
    return isOwner && !viewModel.post.outcome && !viewModel.post.isArchived;
  }, [isOwner, viewModel?.post]);

  // hasRequested check for non-owner
  useEffect(() => {
    if (!viewModel?.post.id || isOwner) return;

    let cancelled = false;
    const check = async () => {
      setIsLoadingHasRequested(true);
      try {
        const result = await adoptionActions.hasRequested(viewModel.post.id);
        if (!cancelled) setHasRequested(result);
      } catch {
        if (!cancelled) setHasRequested(false);
      } finally {
        if (!cancelled) setIsLoadingHasRequested(false);
      }
    };
    check();

    return () => {
      cancelled = true;
    };
  }, [viewModel, isOwner, adoptionActions]);

  // Load adoption requests for owner
  useEffect(() => {
    if (!viewModel?.post.id || !isOwner) return;
    adoptionActions.loadRequests(viewModel.post.id);
  }, [viewModel, isOwner, adoptionActions]);

  // Funding goal auto-fetch
  useEffect(() => {
    if (!viewModel?.post.id) return;

    let cancelled = false;
    const fetch = async () => {
      setIsLoadingFundingGoal(true);
      try {
        const goal = await presenter.fetchFundingGoal(viewModel.post.id);
        if (!cancelled) setFundingGoal(goal);
      } catch (error) {
        console.error("Error fetching funding goal:", error);
        if (!cancelled) setFundingGoal(null);
      } finally {
        if (!cancelled) setIsLoadingFundingGoal(false);
      }
    };
    fetch();

    return () => {
      cancelled = true;
    };
  }, [viewModel?.post.id, presenter]);

  // Load pet data
  const loadPet = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await presenter.getViewModel(id);

        if (isMountedRef.current) {
          if (result) {
            setViewModel(result);
          } else {
            setError("ไม่พบข้อมูลน้องที่ค้นหา");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้";
          setError(message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Modal actions
  const openAdoptionModal = useCallback(() => setIsAdoptionModalOpen(true), []);
  const closeAdoptionModal = useCallback(
    () => setIsAdoptionModalOpen(false),
    [],
  );
  const openCloseModal = useCallback(() => setIsCloseModalOpen(true), []);
  const closeCloseModal = useCallback(() => setIsCloseModalOpen(false), []);

  const handleAdoptClick = useCallback(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    openAdoptionModal();
  }, [user, router, openAdoptionModal]);

  const handleClosePost = useCallback(
    async (outcome: PetPostOutcome) => {
      if (!isOwner || !viewModel?.post.id) return;

      setIsClosingPost(true);
      try {
        // Use repository via factory instead of direct fetch
        const updatedPost = await presenter.close(viewModel.post.id, outcome);

        // Update local state with the closed post
        setViewModel((prev) =>
          prev
            ? {
                ...prev,
                post: updatedPost,
              }
            : null,
        );

        closeCloseModal();
        router.refresh();
      } catch (error) {
        console.error("Close post error:", error);
        alert("ไม่สามารถปิดโพสต์ได้ กรุณาลองใหม่");
      } finally {
        setIsClosingPost(false);
      }
    },
    [viewModel?.post.id, isOwner, presenter, closeCloseModal, router],
  );

  /**
   * Fetch funding goal for a pet post
   */
  const fetchFundingGoal = useCallback(
    async (petPostId: string) => {
      setIsLoadingFundingGoal(true);
      try {
        const goal = await presenter.fetchFundingGoal(petPostId);
        if (isMountedRef.current) {
          setFundingGoal(goal);
        }
      } catch (error) {
        console.error("Error fetching funding goal:", error);
        if (isMountedRef.current) {
          setFundingGoal(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoadingFundingGoal(false);
        }
      }
    },
    [presenter],
  );

  const handleApproveRequest = useCallback(
    async (id: string) => {
      setProcessingRequestId(id);
      const result = await adoptionActions.updateStatus(id, "approved");
      if (result && viewModel?.post.id) {
        await adoptionActions.loadRequests(viewModel.post.id);
      } else {
        alert("ไม่สามารถอนุมัติได้ กรุณาลองใหม่");
      }
      setProcessingRequestId(null);
    },
    [viewModel, adoptionActions],
  );

  const handleRejectRequest = useCallback(
    async (id: string) => {
      setProcessingRequestId(id);
      const result = await adoptionActions.updateStatus(id, "rejected");
      if (result && viewModel?.post.id) {
        await adoptionActions.loadRequests(viewModel.post.id);
      } else {
        alert("ไม่สามารถปฏิเสธได้ กรุณาลองใหม่");
      }
      setProcessingRequestId(null);
    },
    [viewModel, adoptionActions],
  );

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    {
      viewModel,
      loading,
      error,
      isOwner,
      canClose,
      isAdoptionModalOpen,
      isCloseModalOpen,
      isClosingPost,
      fundingGoal,
      isLoadingFundingGoal,
      hasRequested,
      isLoadingHasRequested,
      adoptionRequests,
      adoptionRequestsTotal,
      adoptionRequestsLoading,
      processingRequestId,
    },
    {
      loadPet,
      clearError,
      openAdoptionModal,
      closeAdoptionModal,
      openCloseModal,
      closeCloseModal,
      handleAdoptClick,
      handleClosePost,
      fetchFundingGoal,
      handleApproveRequest,
      handleRejectRequest,
    },
  ];
}
