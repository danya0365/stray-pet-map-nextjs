"use client";

import type { PetFundingGoal } from "@/domain/entities/donation";
import { useDonationContext } from "@/presentation/components/donation";
import { usePetDetailPresenter } from "@/presentation/hooks/usePetDetailPresenter";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
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

  // Fetch funding goal
  const [fundingGoal, setFundingGoal] = useState<PetFundingGoal | null>(null);

  // Report modal state
  const reportModal = useModalState(false);

  // Coming Soon modal state
  const comingSoonModal = useComingSoonModal();

  useEffect(() => {
    const fetchFundingGoal = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data } = await supabase
        .from("pet_post_funding_goals")
        .select("*")
        .eq("pet_post_id", viewModel.post.id)
        .eq("is_active", true)
        .single();

      if (data) {
        setFundingGoal({
          id: data.id,
          petPostId: data.pet_post_id,
          goalType: data.goal_type as
            | "medical"
            | "food"
            | "shelter"
            | "transport"
            | "other",
          targetAmount: Number(data.target_amount),
          currentAmount: Number(data.current_amount),
          description: data.description || undefined,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          isActive: data.is_active,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });
      }
    };

    fetchFundingGoal();
  }, [viewModel.post.id]);

  // Donation handling
  const { openForPet } = useDonationContext();

  const handleDonateClick = () => {
    openForPet(viewModel.post.id, viewModel.post.title);
  };

  // Button click handlers for features not yet implemented
  const handleFoundPetClick = () => {
    comingSoonModal.open("แจ้งพบเจอน้อง (การตามหาเจ้าของ)");
  };

  const handleShareClick = () => {
    // Try native share API first, fallback to coming soon
    if (navigator.share) {
      navigator
        .share({
          title: viewModel.post.title,
          text: `ดู${viewModel.post.title} ใน StrayPetMap`,
          url: window.location.href,
        })
        .catch(() => {
          // User cancelled or failed
        });
    } else {
      comingSoonModal.open("แชร์ไปยัง Social Media");
    }
  };

  return (
    <PetDetailView
      viewModel={viewModel}
      fundingGoal={fundingGoal}
      isOwner={isOwner}
      canClose={canClose}
      isAdoptionModalOpen={isAdoptionModalOpen}
      isCloseModalOpen={isCloseModalOpen}
      isClosingPost={isClosingPost}
      isReportModalOpen={reportModal.isOpen}
      isComingSoonModalOpen={comingSoonModal.isOpen}
      comingSoonFeature={comingSoonModal.feature}
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
    />
  );
}
