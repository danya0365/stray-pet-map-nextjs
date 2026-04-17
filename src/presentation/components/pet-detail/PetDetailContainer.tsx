"use client";

import type { PetFundingGoal } from "@/domain/entities/donation";
import { useDonationContext } from "@/presentation/components/donation";
import { usePetDetailPresenter } from "@/presentation/hooks/usePetDetailPresenter";
import type { PetDetailViewModel } from "@/presentation/presenters/pet-detail/PetDetailPresenter";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { PetDetailView } from "./PetDetailView";

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

  return (
    <PetDetailView
      viewModel={viewModel}
      fundingGoal={fundingGoal}
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
      onDonateClick={handleDonateClick}
    />
  );
}
