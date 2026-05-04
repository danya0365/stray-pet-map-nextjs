"use client";

import type { DonationTargetType } from "@/domain/entities/donation";
import { useCallback, useMemo, useState } from "react";

export interface DonationFormState {
  targetType: DonationTargetType;
  selectedAmount: number;
  customAmount: string;
  message: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  showOnLeaderboard: boolean;
  isLoading: boolean;
  validationError: string | null;
  finalAmount: number;
}

export interface DonationFormActions {
  setTargetType: (v: DonationTargetType) => void;
  setSelectedAmount: (v: number) => void;
  setCustomAmount: (v: string) => void;
  setMessage: (v: string) => void;
  setDonorName: (v: string) => void;
  setDonorEmail: (v: string) => void;
  setIsAnonymous: (v: boolean) => void;
  setShowOnLeaderboard: (v: boolean) => void;
  handleDonate: () => Promise<void>;
  clearError: () => void;
  resetForm: () => void;
}

export interface UseDonationFormOptions {
  /** Callback that receives validated params and performs the actual donation */
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
  /** Initial target type (defaults to "fund") */
  initialTargetType?: DonationTargetType;
  /** Pre-filled amount (e.g., from URL query param) */
  initialAmount?: number;
  /** Pre-filled donor name (e.g., from user profile) */
  initialDonorName?: string;
  /** Pre-filled donor email (e.g., from user profile) */
  initialDonorEmail?: string;
  /** Optional pet context (for pet-specific donations) */
  petPostId?: string;
}

export function useDonationForm(
  options: UseDonationFormOptions,
): [DonationFormState, DonationFormActions] {
  const {
    onDonate,
    initialTargetType = "fund",
    initialAmount,
    initialDonorName = "",
    initialDonorEmail = "",
    petPostId,
  } = options;

  const [targetType, setTargetType] = useState<DonationTargetType>(initialTargetType);
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount ?? 100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [donorName, setDonorName] = useState<string>(initialDonorName);
  const [donorEmail, setDonorEmail] = useState<string>(initialDonorEmail);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const finalAmount = useMemo(
    () => (customAmount ? parseInt(customAmount) || 0 : selectedAmount),
    [customAmount, selectedAmount],
  );

  const handleDonate = useCallback(async () => {
    if (finalAmount < 20) {
      setValidationError("กรุณาระบุจำนวนอย่างน้อย 20 บาท");
      return;
    }
    setValidationError(null);
    setIsLoading(true);

    try {
      await onDonate({
        amount: finalAmount,
        message,
        targetType,
        petPostId: targetType === "pet" ? petPostId : undefined,
        donorName: donorName || undefined,
        donorEmail: donorEmail || undefined,
        isAnonymous,
        showOnLeaderboard,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    finalAmount,
    message,
    targetType,
    petPostId,
    donorName,
    donorEmail,
    isAnonymous,
    showOnLeaderboard,
    onDonate,
  ]);

  const resetForm = useCallback(() => {
    setTargetType(initialTargetType);
    setSelectedAmount(initialAmount ?? 100);
    setCustomAmount("");
    setMessage("");
    setDonorName(initialDonorName);
    setDonorEmail(initialDonorEmail);
    setIsAnonymous(false);
    setShowOnLeaderboard(true);
    setValidationError(null);
    setIsLoading(false);
  }, [initialTargetType, initialAmount, initialDonorName, initialDonorEmail]);

  return [
    {
      targetType,
      selectedAmount,
      customAmount,
      message,
      donorName,
      donorEmail,
      isAnonymous,
      showOnLeaderboard,
      isLoading,
      validationError,
      finalAmount,
    },
    {
      setTargetType,
      setSelectedAmount,
      setCustomAmount,
      setMessage,
      setDonorName,
      setDonorEmail,
      setIsAnonymous,
      setShowOnLeaderboard,
      handleDonate,
      clearError: () => setValidationError(null),
      resetForm,
    },
  ];
}
