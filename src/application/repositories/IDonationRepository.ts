/**
 * IDonationRepository
 * Repository interface for donation/checkout operations
 * Following Clean Architecture pattern
 * Supports dual mode: pet-specific + general fund + guest donations
 */

import type { DonationTargetType } from "@/domain/entities/donation";

export interface DonationCheckoutParams {
  amount: number; // in THB
  message?: string;
  successUrl: string;
  cancelUrl: string;

  // Dual mode support
  targetType: DonationTargetType; // 'pet' | 'fund'
  petPostId?: string; // required if targetType = 'pet'

  // Guest donation support
  donorName?: string; // for guest donations or name override
  donorEmail?: string; // for receipt
  isAnonymous?: boolean;
  showOnLeaderboard?: boolean;
}

export interface DonationCheckoutResult {
  sessionId: string;
  url: string;
}

export interface IDonationRepository {
  createCheckoutSession(
    params: DonationCheckoutParams,
  ): Promise<DonationCheckoutResult>;
}
