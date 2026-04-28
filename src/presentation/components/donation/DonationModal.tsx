"use client";

import type { DonationTargetType } from "@/domain/entities/donation";
import { useDonationForm } from "@/presentation/presenters/donation/useDonationForm";
import { DonationModalView } from "./DonationModalView";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (params: {
    amount: number;
    message: string;
    targetType: DonationTargetType;
    petPostId?: string;
    donorName?: string;
    donorEmail?: string;
    isAnonymous: boolean;
    showOnLeaderboard: boolean;
  }) => Promise<void>;
  // Optional: for pet-specific donation mode
  petPostId?: string;
  petName?: string;
  // User info (if logged in)
  userDisplayName?: string;
  userEmail?: string;
  isGuest?: boolean;
}

export function DonationModal({
  isOpen,
  onClose,
  onDonate,
  petPostId,
  petName,
  userDisplayName,
  userEmail,
  isGuest = true,
}: DonationModalProps) {
  const initialTargetType: DonationTargetType = petPostId ? "pet" : "fund";

  const [formState, formActions] = useDonationForm({
    onDonate,
    initialTargetType,
    initialDonorName: userDisplayName,
    initialDonorEmail: userEmail,
    petPostId,
  });

  return (
    <DonationModalView
      isOpen={isOpen}
      onClose={onClose}
      state={formState}
      actions={formActions}
      petName={petName}
      petPostId={petPostId}
      isGuest={isGuest}
    />
  );
}
