"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";
import type { PetPostOutcome } from "@/domain/entities/pet-post";

interface UsePetDetailPresenterProps {
  initialViewModel: PetDetailViewModel;
}

interface UsePetDetailPresenterReturn {
  // State
  viewModel: PetDetailViewModel;
  isOwner: boolean;
  canClose: boolean;
  isAdoptionModalOpen: boolean;
  isCloseModalOpen: boolean;
  isClosingPost: boolean;

  // Actions
  openAdoptionModal: () => void;
  closeAdoptionModal: () => void;
  openCloseModal: () => void;
  closeCloseModal: () => void;
  handleAdoptClick: () => void;
  handleClosePost: (outcome: PetPostOutcome) => Promise<void>;
}

export function usePetDetailPresenter({
  initialViewModel,
}: UsePetDetailPresenterProps): UsePetDetailPresenterReturn {
  const router = useRouter();
  const { user } = useAuthStore();
  const [viewModel, setViewModel] = useState<PetDetailViewModel>(initialViewModel);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isClosingPost, setIsClosingPost] = useState(false);

  const { post } = viewModel;

  // Computed states
  const isOwner = useMemo(() => user?.id === post.profileId, [user?.id, post.profileId]);

  const canClose = useMemo(
    () => isOwner && !post.outcome && !post.isArchived,
    [isOwner, post.outcome, post.isArchived]
  );

  // Actions
  const openAdoptionModal = useCallback(() => setIsAdoptionModalOpen(true), []);
  const closeAdoptionModal = useCallback(() => setIsAdoptionModalOpen(false), []);
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
      if (!isOwner) return;

      setIsClosingPost(true);
      try {
        const res = await fetch(`/api/pet-posts/${post.id}/close`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outcome }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to close post");
        }

        const updatedPost = await res.json();

        // Update local state with the closed post
        setViewModel((prev) => ({
          ...prev,
          post: updatedPost.post || prev.post,
        }));

        closeCloseModal();
        router.refresh(); // Refresh to get server-side updates
      } catch (error) {
        console.error("Close post error:", error);
        alert("ไม่สามารถปิดโพสต์ได้ กรุณาลองใหม่");
      } finally {
        setIsClosingPost(false);
      }
    },
    [post.id, isOwner, closeCloseModal, router]
  );

  return {
    viewModel,
    isOwner,
    canClose,
    isAdoptionModalOpen,
    isCloseModalOpen,
    isClosingPost,
    openAdoptionModal,
    closeAdoptionModal,
    openCloseModal,
    closeCloseModal,
    handleAdoptClick,
    handleClosePost,
  };
}
