/**
 * Donation Entity Types
 * Following Clean Architecture - Domain layer
 */

export type DonationTargetType = "pet" | "fund" | "dev";
export type DonationPaymentMethod = "stripe_promptpay" | "stripe_card";
export type DonationPaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";
export type FundingGoalType =
  | "medical"
  | "food"
  | "shelter"
  | "transport"
  | "other";

/**
 * Core Donation entity
 */
export interface Donation {
  id: string;

  // Donor info
  donorId: string | null; // null = guest
  donorName: string;
  donorEmail?: string;
  isAnonymous: boolean;

  // Target
  targetType: DonationTargetType;
  petPostId: string | null; // null = general fund

  // Payment
  amount: number;
  currency: string;
  paymentMethod: DonationPaymentMethod;
  paymentStatus: DonationPaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;

  // Message & Recognition
  message?: string;
  showOnLeaderboard: boolean;

  // Gamification
  pointsAwarded: number;

  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

/**
 * Funding Goal for pet-specific fundraising
 */
export interface PetFundingGoal {
  id: string;
  petPostId: string;
  goalType: FundingGoalType;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  deadline?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Leaderboard entry
 */
export interface DonationLeaderboardEntry {
  donorId: string;
  donorName: string;
  avatarUrl?: string;
  level: number;
  totalAmount: number;
  donationCount: number;
  lastDonationAt?: Date;
}

/**
 * Donation statistics
 */
export interface DonationStats {
  totalDonations: number;
  monthlyDonations: number;
  weeklyDonations: number;
  totalRaised: number;
  monthlyRaised: number;
  weeklyRaised: number;
  uniqueDonors: number;
}

/**
 * Create donation parameters
 */
export interface CreateDonationParams {
  donorId?: string; // undefined = guest
  donorName?: string;
  donorEmail?: string;
  isAnonymous?: boolean;
  targetType: DonationTargetType;
  petPostId?: string;
  amount: number;
  message?: string;
  showOnLeaderboard?: boolean;
  stripeSessionId?: string; // Generated server-side for client checkout
}

/**
 * Checkout session parameters (for Stripe)
 */
export interface DonationCheckoutParams {
  targetType: DonationTargetType;
  petPostId?: string;
  amount: number;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous?: boolean;
  showOnLeaderboard?: boolean;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Checkout session result
 */
export interface DonationCheckoutResult {
  sessionId: string;
  url: string;
}

/**
 * Recent donation for ticker/display
 */
export interface RecentDonation {
  id: string;
  donorName: string;
  amount: number;
  targetType: DonationTargetType;
  petName?: string;
  message?: string;
  createdAt: Date;
}
