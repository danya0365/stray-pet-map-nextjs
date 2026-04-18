import type { IDonationRepository } from "@/application/repositories/IDonationRepository";
import type {
  CreateDonationParams,
  Donation,
  DonationLeaderboardEntry,
  DonationStats,
  PetFundingGoal,
  RecentDonation,
} from "@/domain/entities/donation";

interface CheckoutParams {
  amount: number;
  message: string;
  targetType: "pet" | "fund" | "dev";
  petPostId?: string;
  donorName?: string;
  donorEmail?: string;
  isAnonymous: boolean;
  showOnLeaderboard: boolean;
  successUrl: string;
  cancelUrl: string;
}

/**
 * ApiDonationRepository
 * Client-side implementation สำหรับดึง donation data
 * ✅ Calls public API endpoints
 * ✅ Implements IDonationRepository (client-side subset)
 */
export class ApiDonationRepository implements IDonationRepository {
  /**
   * Create checkout session and redirect (client-side flow)
   * Note: This deviates from IDonationRepository.create by returning URL instead of Donation
   */
  async create(params: CreateDonationParams): Promise<Donation> {
    const checkoutParams: CheckoutParams = {
      amount: params.amount,
      message: params.message || "",
      targetType: params.targetType,
      petPostId: params.petPostId,
      donorName: params.donorName,
      donorEmail: params.donorEmail,
      isAnonymous: params.isAnonymous ?? false,
      showOnLeaderboard: params.showOnLeaderboard ?? true,
      successUrl: `${window.location.origin}/donate/success`,
      cancelUrl: window.location.href,
    };

    // This will redirect - we can't return a proper Donation object client-side
    // The actual donation is created server-side by webhook
    const url = await this.createCheckout(checkoutParams);

    // Redirect to Stripe checkout
    window.location.href = url;

    // Return placeholder (this won't actually be used due to redirect)
    throw new Error("Redirecting to checkout...");
  }

  async createCheckout(params: CheckoutParams): Promise<string> {
    const res = await fetch("/api/donate/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await res.json();
    return url;
  }

  async getLeaderboardAllTime(limit = 50): Promise<DonationLeaderboardEntry[]> {
    return this.getLeaderboard("alltime", limit);
  }

  async getLeaderboardWeekly(limit = 10): Promise<DonationLeaderboardEntry[]> {
    return this.getLeaderboard("weekly", limit);
  }

  async getLeaderboard(
    type: "weekly" | "alltime",
    limit = 50,
  ): Promise<DonationLeaderboardEntry[]> {
    const res = await fetch(
      `/api/donate/leaderboard?type=${type}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch donation leaderboard");
    }

    const data = await res.json();
    return data.entries || [];
  }

  async getStats(): Promise<DonationStats> {
    const res = await fetch("/api/donate/stats", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      // Return default stats on error
      return {
        totalDonations: 0,
        monthlyDonations: 0,
        weeklyDonations: 0,
        totalRaised: 0,
        monthlyRaised: 0,
        weeklyRaised: 0,
        uniqueDonors: 0,
      };
    }

    const data = await res.json();
    return (
      data.stats || {
        totalDonations: 0,
        monthlyDonations: 0,
        weeklyDonations: 0,
        totalRaised: 0,
        monthlyRaised: 0,
        weeklyRaised: 0,
        uniqueDonors: 0,
      }
    );
  }

  // ============================================================
  // CORE OPERATIONS (API proxy)
  // ============================================================

  async findByStripeSessionId(sessionId: string): Promise<Donation | null> {
    const res = await fetch(`/api/donate/session?sessionId=${sessionId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.donation || null;
  }

  async completeDonation(
    donationId: string,
    paymentIntentId: string,
    points: number,
  ): Promise<Donation> {
    const res = await fetch("/api/donate/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donationId, paymentIntentId, points }),
    });
    if (!res.ok) throw new Error("Failed to complete donation");
    const data = await res.json();
    return data.donation;
  }

  // ============================================================
  // LEADERBOARD & STATS (API proxy)
  // ============================================================

  async getRecentDonations(limit = 10): Promise<RecentDonation[]> {
    const res = await fetch(`/api/donate/recent?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.donations || [];
  }

  // ============================================================
  // PET FUNDING (API proxy)
  // ============================================================

  async getPetFundingGoal(petPostId: string): Promise<PetFundingGoal | null> {
    const res = await fetch(`/api/donate/funding-goal?petPostId=${petPostId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.goal || null;
  }

  // ============================================================
  // DONOR OPERATIONS (API proxy)
  // ============================================================

  async getDonorTotal(
    donorId: string,
  ): Promise<{ count: number; amount: number }> {
    const res = await fetch(`/api/donate/donor-stats?donorId=${donorId}`);
    if (!res.ok) return { count: 0, amount: 0 };
    const data = await res.json();
    return data.total || { count: 0, amount: 0 };
  }

  async hasDonatedThisMonth(): Promise<boolean> {
    throw new Error("hasDonatedThisMonth is not implemented in API repository");
  }

  async getTodayDonations(): Promise<{ points_awarded: number }[]> {
    throw new Error("getTodayDonations is server-side only");
  }

  async awardBadges(): Promise<void> {
    throw new Error("awardBadges is server-side only");
  }
}
