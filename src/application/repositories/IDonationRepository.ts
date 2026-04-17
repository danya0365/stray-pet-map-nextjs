/**
 * IDonationRepository
 * Repository interface for donation/checkout operations
 * Following Clean Architecture pattern
 */

export interface DonationCheckoutParams {
  amount: number; // in THB
  message?: string;
  successUrl: string;
  cancelUrl: string;
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
