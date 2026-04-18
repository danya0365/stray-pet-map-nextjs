/**
 * IStripeRepository
 * Repository interface for Stripe interactions
 * Following Clean Architecture - Application layer
 */

import type { DonationTargetType } from "@/domain/entities/donation";
import type Stripe from "stripe";

export interface CheckoutSessionParams {
  amount: number; // in THB
  message?: string;
  successUrl: string;
  cancelUrl: string;

  // Dual mode support
  targetType: DonationTargetType; // 'pet' | 'fund' | 'dev'
  petPostId?: string; // required when targetType is 'pet'

  // Guest donation support
  donorName?: string; // for guest donations or name override
  donorEmail?: string; // for receipt
  isAnonymous?: boolean;
  showOnLeaderboard?: boolean;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface IStripeRepository {
  createCheckoutSession(
    params: CheckoutSessionParams,
  ): Promise<CheckoutSessionResult>;
  constructEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Promise<Stripe.Event>;
}
