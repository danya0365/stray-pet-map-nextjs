"use client";

import { FEATURE_FLAGS } from "@/config/features";
import { useDonationContext } from "@/presentation/components/donation";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";
import { usePetDetailPresenter } from "@/presentation/presenters/pet-detail/usePetDetailPresenter";
import { useState } from "react";
import { PetDetailView } from "./PetDetailView";

// Simple modal state hook
function useModalState(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

// Coming Soon modal with feature name
function useComingSoonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState("");
  return {
    isOpen,
    feature,
    open: (featureName: string) => {
      setFeature(featureName);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  };
}

interface PetDetailContainerProps {
  initialViewModel: PetDetailViewModel;
}

// Container Component - จัดการ State และ Business Logic
export function PetDetailContainer({
  initialViewModel,
}: PetDetailContainerProps) {
  const [state, actions] = usePetDetailPresenter({ initialViewModel });

  const {
    viewModel,
    isOwner,
    canClose,
    isAdoptionModalOpen,
    isCloseModalOpen,
    isClosingPost,
    fundingGoal,
    hasRequested,
    isLoadingHasRequested,
    adoptionRequests,
    adoptionRequestsTotal,
    adoptionRequestsLoading,
    processingRequestId,
  } = state;

  const {
    openAdoptionModal,
    closeAdoptionModal,
    openCloseModal,
    closeCloseModal,
    handleAdoptClick,
    handleClosePost,
    handleApproveRequest,
    handleRejectRequest,
  } = actions;

  // Report modal state
  const reportModal = useModalState(false);

  // Coming Soon modal state
  const comingSoonModal = useComingSoonModal();

  // Donation handling
  const { openForPet } = useDonationContext();

  const handleDonateClick = () => {
    if (!viewModel) return;
    openForPet(viewModel.post.id, viewModel.post.title);
  };

  // Button click handlers for features not yet implemented
  const handleFoundPetClick = () => {
    comingSoonModal.open("แจ้งพบเจอน้อง (การตามหาเจ้าของ)");
  };

  const handleShareClick = () => {
    if (!viewModel) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: viewModel.post.title,
          text: `ดู${viewModel.post.title} ใน StrayPetMap`,
          url,
        })
        .catch(() => {
          // User cancelled or failed
        });
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("คัดลอกลิงก์แล้ว");
        })
        .catch(() => {
          comingSoonModal.open("แชร์ไปยัง Social Media");
        });
    } else {
      comingSoonModal.open("แชร์ไปยัง Social Media");
    }
  };

  if (!viewModel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">ไม่พบข้อมูลน้องที่ค้นหา</p>
        </div>
      </div>
    );
  }

  return (
    <PetDetailView
      viewModel={viewModel}
      fundingGoal={fundingGoal}
      isOwner={isOwner}
      canClose={canClose}
      isAdoptionModalOpen={isAdoptionModalOpen}
      isCloseModalOpen={isCloseModalOpen}
      isClosingPost={isClosingPost}
      isDonationEnabled={FEATURE_FLAGS.petDonationEnabled}
      isReportModalOpen={reportModal.isOpen}
      isComingSoonModalOpen={comingSoonModal.isOpen}
      comingSoonFeature={comingSoonModal.feature}
      hasRequested={hasRequested}
      isLoadingHasRequested={isLoadingHasRequested}
      adoptionRequests={adoptionRequests}
      adoptionRequestsTotal={adoptionRequestsTotal}
      adoptionRequestsLoading={adoptionRequestsLoading}
      processingRequestId={processingRequestId}
      onOpenAdoptionModal={openAdoptionModal}
      onCloseAdoptionModal={closeAdoptionModal}
      onOpenCloseModal={openCloseModal}
      onCloseCloseModal={closeCloseModal}
      onOpenReportModal={reportModal.open}
      onCloseReportModal={reportModal.close}
      onCloseComingSoon={comingSoonModal.close}
      onAdoptClick={handleAdoptClick}
      onFoundPetClick={handleFoundPetClick}
      onShareClick={handleShareClick}
      onClosePost={handleClosePost}
      onDonateClick={handleDonateClick}
      onApproveRequest={handleApproveRequest}
      onRejectRequest={handleRejectRequest}
    />
  );
}
