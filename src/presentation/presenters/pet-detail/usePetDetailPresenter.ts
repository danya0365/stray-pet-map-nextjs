"use client";

/**
 * usePetDetailPresenter
 * Custom hook for PetDetail presenter state management
 * ✅ Uses presenter pattern with API repository injection via factory
 * ✅ Follows Clean Architecture pattern
 */

import type { PetPostOutcome } from "@/domain/entities/pet-post";
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

  // Computed states
  const isOwner = useMemo(() => {
    if (!user?.id || !viewModel?.post.profileId) return false;
    return user.id === viewModel.post.profileId;
  }, [user?.id, viewModel?.post.profileId]);

  const canClose = useMemo(() => {
    if (!viewModel?.post) return false;
    return isOwner && !viewModel.post.outcome && !viewModel.post.isArchived;
  }, [isOwner, viewModel?.post]);

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
    },
  ];
}
