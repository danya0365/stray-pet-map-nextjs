"use client";

import { useDonationForm } from "./useDonationForm";
import { useDonationPresenter } from "./useDonationPresenter";

export interface DonateFormState {
  targetType: "fund" | "dev";
  selectedAmount: number;
  customAmount: string;
  message: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  showOnLeaderboard: boolean;
  localError: string | null;
  isLoading: boolean;
  serverError: string | null;
}

export interface DonateFormActions {
  setTargetType: (v: "fund" | "dev") => void;
  setSelectedAmount: (v: number) => void;
  setCustomAmount: (v: string) => void;
  setMessage: (v: string) => void;
  setDonorName: (v: string) => void;
  setDonorEmail: (v: string) => void;
  setIsAnonymous: (v: boolean) => void;
  setShowOnLeaderboard: (v: boolean) => void;
  handleDonate: () => Promise<void>;
  clearLocalError: () => void;
}

export function useDonatePresenter(): [DonateFormState, DonateFormActions] {
  const [donationState, donationActions] = useDonationPresenter();

  const [formState, formActions] = useDonationForm({
    onDonate: donationActions.createDonation,
  });

  return [
    {
      targetType: formState.targetType as "fund" | "dev",
      selectedAmount: formState.selectedAmount,
      customAmount: formState.customAmount,
      message: formState.message,
      donorName: formState.donorName,
      donorEmail: formState.donorEmail,
      isAnonymous: formState.isAnonymous,
      showOnLeaderboard: formState.showOnLeaderboard,
      localError: formState.validationError,
      isLoading: formState.isLoading || donationState.loading,
      serverError: donationState.error,
    },
    {
      setTargetType: (v) => formActions.setTargetType(v),
      setSelectedAmount: formActions.setSelectedAmount,
      setCustomAmount: formActions.setCustomAmount,
      setMessage: formActions.setMessage,
      setDonorName: formActions.setDonorName,
      setDonorEmail: formActions.setDonorEmail,
      setIsAnonymous: formActions.setIsAnonymous,
      setShowOnLeaderboard: formActions.setShowOnLeaderboard,
      handleDonate: formActions.handleDonate,
      clearLocalError: formActions.clearError,
    },
  ];
}
