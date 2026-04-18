/**
 * DonationPresenter
 * Handles business logic for donation operations
 * Receives repositories via dependency injection
 * Following Clean Architecture pattern
 */

import type { IDonationRepository } from "@/application/repositories/IDonationRepository";
import type {
  CreateDonationParams,
  Donation,
  DonationLeaderboardEntry,
  DonationStats,
  PetFundingGoal,
  RecentDonation,
} from "@/domain/entities/donation";
import type Stripe from "stripe";

export interface WebhookProcessingResult {
  success: boolean;
  donationId?: string;
  pointsAwarded?: number;
  error?: string;
}

export interface LeaderboardResult {
  success: boolean;
  data?: DonationLeaderboardEntry[];
  error?: string;
}

export interface StatsResult {
  success: boolean;
  data?: DonationStats;
  error?: string;
}

/**
 * Presenter for donation operations
 * ✅ Receives repositories via constructor injection
 * ✅ Handles all business logic for webhook processing
 */
export class DonationPresenter {
  constructor(private readonly donationRepo: IDonationRepository) {}

  // ============================================================
  // WEBHOOK PROCESSING (For API Routes)
  // ============================================================

  /**
   * Process Stripe checkout.session.completed event
   * - Finds or creates donation record
   * - Calculates points (1 point per 10 THB, cap 200/day)
   * - Completes donation with points
   * - Awards badges via RPC
   */
  async processCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<WebhookProcessingResult> {
    const metadata = session.metadata;
    if (!metadata) {
      return { success: false, error: "Missing session metadata" };
    }

    const amount = (session.amount_total || 0) / 100; // Convert from satang to THB
    const donorName = metadata.donor_name || "ผู้ใจดี";
    const targetType = (metadata.target_type || "fund") as
      | "pet"
      | "fund"
      | "dev";
    const petPostId = metadata.pet_post_id || undefined;
    const message = metadata.message;
    const isAnonymous = metadata.is_anonymous === "true";
    const showOnLeaderboard = metadata.show_on_leaderboard !== "false";

    console.log("💚 Donation completed:", {
      sessionId: session.id,
      amount,
      donorName,
      targetType,
      petPostId,
    });

    try {
      // 1. Find or create donation record
      let donation = await this.donationRepo.findByStripeSessionId(session.id);

      if (!donation) {
        const createParams: CreateDonationParams = {
          stripeSessionId: session.id,
          targetType,
          petPostId,
          amount,
          donorName,
          donorEmail: session.customer_email || undefined,
          message,
          isAnonymous,
          showOnLeaderboard,
        };
        donation = await this.donationRepo.create(createParams);
      }

      // 2. Calculate points (1 point per 10 THB, cap 200/day)
      const calculatedPoints = await this.calculatePoints(
        donation.donorId,
        amount,
      );

      // 3. Complete the donation with points
      const completedDonation = await this.donationRepo.completeDonation(
        donation.id,
        session.payment_intent as string,
        calculatedPoints > 0 ? calculatedPoints : 0,
      );

      console.log("✅ Donation saved:", {
        donationId: completedDonation.id,
        points: completedDonation.pointsAwarded,
      });

      // 4. Check and award badges via RPC if donor is logged in
      if (donation.donorId && calculatedPoints > 0) {
        await this.awardBadges(donation.donorId);
      }

      return {
        success: true,
        donationId: completedDonation.id,
        pointsAwarded: completedDonation.pointsAwarded,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing donation:", error);
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  /**
   * Calculate points for donation (1 point per 10 THB, cap 200/day)
   */
  private async calculatePoints(
    donorId: string | null,
    amount: number,
  ): Promise<number> {
    const maxPoints = 200;

    if (!donorId) {
      // Guest donations don't get points
      return 0;
    }

    // Check daily cap
    const todayDonations = await this.donationRepo.getTodayDonations(donorId);

    const pointsToday = todayDonations.reduce(
      (sum, d) => sum + d.points_awarded,
      0,
    );

    const availablePoints = maxPoints - pointsToday;
    const calculatedPoints = Math.min(Math.floor(amount / 10), availablePoints);

    return Math.max(0, calculatedPoints);
  }

  /**
   * Award badges via RPC
   */
  private async awardBadges(donorId: string): Promise<void> {
    await this.donationRepo.awardBadges(donorId);
  }

  // ============================================================
  // PUBLIC API METHODS
  // ============================================================

  /**
   * Get weekly donation leaderboard
   */
  async getLeaderboardWeekly(limit = 10): Promise<LeaderboardResult> {
    try {
      const entries = await this.donationRepo.getLeaderboardWeekly(limit);
      return { success: true, data: entries };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get all-time donation leaderboard
   */
  async getLeaderboardAllTime(limit = 50): Promise<LeaderboardResult> {
    try {
      const entries = await this.donationRepo.getLeaderboardAllTime(limit);
      return { success: true, data: entries };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get donation statistics
   */
  async getStats(): Promise<StatsResult> {
    try {
      const stats = await this.donationRepo.getStats();
      return { success: true, data: stats };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // DIRECT REPOSITORY PASS-THROUGH (for API routes)
  // ============================================================

  async findByStripeSessionId(sessionId: string): Promise<Donation | null> {
    return this.donationRepo.findByStripeSessionId(sessionId);
  }

  async completeDonation(
    donationId: string,
    paymentIntentId: string,
    points: number,
  ): Promise<Donation> {
    return this.donationRepo.completeDonation(
      donationId,
      paymentIntentId,
      points,
    );
  }

  async getRecentDonations(limit = 10): Promise<RecentDonation[]> {
    return this.donationRepo.getRecentDonations(limit);
  }

  async getPetFundingGoal(petPostId: string): Promise<PetFundingGoal | null> {
    return this.donationRepo.getPetFundingGoal(petPostId);
  }

  async getDonorTotal(
    donorId: string,
  ): Promise<{ count: number; amount: number }> {
    return this.donationRepo.getDonorTotal(donorId);
  }

  async hasDonatedThisMonth(donorId: string): Promise<boolean> {
    return this.donationRepo.hasDonatedThisMonth(donorId);
  }

  /**
   * Create donation (client-side checkout)
   */
  async create(params: CreateDonationParams): Promise<Donation> {
    return this.donationRepo.create(params);
  }
}
