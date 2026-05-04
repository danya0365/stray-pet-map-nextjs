import type {
  CreateDonationParams,
  Donation,
  DonationLeaderboardEntry,
  DonationStats,
  PetFundingGoal,
  RecentDonation,
} from "@/domain/entities/donation";

/**
 * IDonationRepository
 * Repository interface for donation data access
 * Following Clean Architecture - Application layer
 *
 * ✅ Same interface for client and server
 * ✅ ApiDonationRepository: calls through Next.js API proxy
 * ✅ SupabaseDonationRepository: direct database access
 */
export interface IDonationRepository {
  // ============================================================
  // CORE OPERATIONS
  // ============================================================

  /**
   * Create a new donation record
   */
  create(params: CreateDonationParams): Promise<Donation>;

  /**
   * Find donation by Stripe session ID
   */
  findByStripeSessionId(sessionId: string): Promise<Donation | null>;

  /**
   * Update donation status and award points
   */
  completeDonation(
    donationId: string,
    paymentIntentId: string,
    points: number,
  ): Promise<Donation>;

  // ============================================================
  // LEADERBOARD & STATS
  // ============================================================

  /**
   * Get all-time leaderboard
   */
  getLeaderboardAllTime(limit?: number): Promise<DonationLeaderboardEntry[]>;

  /**
   * Get weekly leaderboard
   */
  getLeaderboardWeekly(limit?: number): Promise<DonationLeaderboardEntry[]>;

  /**
   * Get donation stats
   */
  getStats(): Promise<DonationStats>;

  /**
   * Get recent completed donations for ticker
   */
  getRecentDonations(limit?: number): Promise<RecentDonation[]>;

  // ============================================================
  // PET FUNDING
  // ============================================================

  /**
   * Get funding goal for a pet post
   */
  getPetFundingGoal(petPostId: string): Promise<PetFundingGoal | null>;

  // ============================================================
  // DONOR OPERATIONS
  // ============================================================

  /**
   * Get donor's total donations (for gamification)
   */
  getDonorTotal(donorId: string): Promise<{ count: number; amount: number }>;

  /**
   * Check if donor has donated this month
   */
  hasDonatedThisMonth(donorId: string): Promise<boolean>;

  /**
   * Get today's donations for points cap calculation
   * Server-side only
   */
  getTodayDonations(donorId: string): Promise<{ points_awarded: number }[]>;

  /**
   * Award badges via RPC
   * Server-side only
   */
  awardBadges(donorId: string): Promise<void>;
}
