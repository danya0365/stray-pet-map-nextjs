"use client";

import { PetDetailView } from "./PetDetailView";
import { usePetDetailPresenter } from "@/presentation/hooks/usePetDetailPresenter";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";

interface PetDetailContainerProps {
  initialViewModel: PetDetailViewModel;
}

// Container Component - จัดการ State และ Business Logic
export function PetDetailContainer({ initialViewModel }: PetDetailContainerProps) {
  const {
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
  } = usePetDetailPresenter({ initialViewModel });

  return (
    <PetDetailView
      viewModel={viewModel}
      isOwner={isOwner}
      canClose={canClose}
      isAdoptionModalOpen={isAdoptionModalOpen}
      isCloseModalOpen={isCloseModalOpen}
      isClosingPost={isClosingPost}
      onOpenAdoptionModal={openAdoptionModal}
      onCloseAdoptionModal={closeAdoptionModal}
      onOpenCloseModal={openCloseModal}
      onCloseCloseModal={closeCloseModal}
      onAdoptClick={handleAdoptClick}
      onClosePost={handleClosePost}
    />
  );
}
