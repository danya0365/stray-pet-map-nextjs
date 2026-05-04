import type { IDonationRepository } from "@/application/repositories/IDonationRepository";
import type {
  CreateDonationParams,
  Donation,
  DonationLeaderboardEntry,
  DonationStats,
  PetFundingGoal,
  RecentDonation,
} from "@/domain/entities/donation";

// Mock data
const MOCK_DONATIONS: Donation[] = [
  {
    id: "don-001",
    donorId: "user-001",
    donorName: "คุณใจดี",
    donorEmail: "kind@example.com",
    isAnonymous: false,
    targetType: "fund",
    petPostId: null,
    amount: 500,
    currency: "THB",
    paymentMethod: "stripe_promptpay",
    paymentStatus: "completed",
    stripeSessionId: "sess_001",
    stripePaymentIntentId: "pi_001",
    message: "ขอให้น้องๆ มีความสุข",
    showOnLeaderboard: true,
    pointsAwarded: 50,
    createdAt: new Date("2026-04-15T10:00:00Z"),
    updatedAt: new Date("2026-04-15T10:00:00Z"),
    completedAt: new Date("2026-04-15T10:05:00Z"),
  },
  {
    id: "don-002",
    donorId: "user-002",
    donorName: "ผู้ใจบุญ",
    donorEmail: undefined,
    isAnonymous: true,
    targetType: "pet",
    petPostId: "pet-001",
    amount: 1000,
    currency: "THB",
    paymentMethod: "stripe_card",
    paymentStatus: "completed",
    stripeSessionId: "sess_002",
    stripePaymentIntentId: "pi_002",
    message: "ช่วยค่ารักษาพยาบาล",
    showOnLeaderboard: false,
    pointsAwarded: 100,
    createdAt: new Date("2026-04-16T14:30:00Z"),
    updatedAt: new Date("2026-04-16T14:30:00Z"),
    completedAt: new Date("2026-04-16T14:35:00Z"),
  },
];

const MOCK_LEADERBOARD: DonationLeaderboardEntry[] = [
  {
    donorId: "user-003",
    donorName: "ฮีโร่นักช่วยเหลือ",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=hero",
    level: 5,
    totalAmount: 5000,
    donationCount: 10,
    lastDonationAt: new Date("2026-04-18T09:00:00Z"),
  },
  {
    donorId: "user-001",
    donorName: "คุณใจดี",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=kind",
    level: 3,
    totalAmount: 2500,
    donationCount: 5,
    lastDonationAt: new Date("2026-04-17T16:00:00Z"),
  },
  {
    donorId: "user-004",
    donorName: "นักรบแมวจร",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior",
    level: 4,
    totalAmount: 1800,
    donationCount: 3,
    lastDonationAt: new Date("2026-04-16T11:00:00Z"),
  },
];

const MOCK_STATS: DonationStats = {
  totalDonations: 150,
  monthlyDonations: 45,
  weeklyDonations: 12,
  totalRaised: 75000,
  monthlyRaised: 22500,
  weeklyRaised: 6000,
  uniqueDonors: 89,
};

/**
 * MockDonationRepository
 * Mock implementation for development and testing
 * Following Clean Architecture - Infrastructure layer
 */
export class MockDonationRepository implements IDonationRepository {
  private donations: Donation[] = [...MOCK_DONATIONS];
  private leaderboard: DonationLeaderboardEntry[] = [...MOCK_LEADERBOARD];
  private stats: DonationStats = { ...MOCK_STATS };

  async create(params: CreateDonationParams): Promise<Donation> {
    // Simulate redirect behavior - client-side mock can't actually redirect
    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donorId: params.donorId || null,
      donorName: params.donorName || "ผู้ใจดี",
      donorEmail: params.donorEmail,
      isAnonymous: params.isAnonymous ?? false,
      targetType: params.targetType,
      petPostId: params.petPostId || null,
      amount: params.amount,
      currency: "THB",
      paymentMethod: "stripe_promptpay",
      paymentStatus: "pending",
      stripeSessionId: params.stripeSessionId || `mock_${Date.now()}`,
      stripePaymentIntentId: undefined,
      message: params.message,
      showOnLeaderboard: params.showOnLeaderboard ?? true,
      pointsAwarded: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: undefined,
    };

    this.donations.unshift(newDonation);
    return newDonation;
  }

  async getLeaderboardAllTime(limit = 50): Promise<DonationLeaderboardEntry[]> {
    return this.leaderboard.slice(0, limit);
  }

  async getLeaderboardWeekly(limit = 10): Promise<DonationLeaderboardEntry[]> {
    // Return same data for mock (in real app would filter by week)
    return this.leaderboard.slice(0, limit);
  }

  async getStats(): Promise<DonationStats> {
    return { ...this.stats };
  }

  // ============================================================
  // CORE OPERATIONS (Mock)
  // ============================================================

  async findByStripeSessionId(sessionId: string): Promise<Donation | null> {
    return this.donations.find((d) => d.stripeSessionId === sessionId) || null;
  }

  async completeDonation(
    donationId: string,
    paymentIntentId: string,
    points: number,
  ): Promise<Donation> {
    const donation = this.donations.find((d) => d.id === donationId);
    if (!donation) throw new Error("Donation not found");

    donation.paymentStatus = "completed";
    donation.stripePaymentIntentId = paymentIntentId;
    donation.pointsAwarded = points;
    donation.completedAt = new Date();
    donation.updatedAt = new Date();

    return donation;
  }

  // ============================================================
  // LEADERBOARD & STATS (Mock)
  // ============================================================

  async getRecentDonations(limit = 10): Promise<RecentDonation[]> {
    return this.donations
      .filter((d) => d.paymentStatus === "completed")
      .slice(0, limit)
      .map((d) => ({
        id: d.id,
        donorName: d.donorName,
        amount: d.amount,
        targetType: d.targetType,
        petName: undefined, // Mock doesn't have pet name
        message: d.message,
        createdAt: d.createdAt,
      }));
  }

  // ============================================================
  // PET FUNDING (Mock)
  // ============================================================

  async getPetFundingGoal(): Promise<PetFundingGoal | null> {
    // Return mock funding goal
    return {
      id: "goal-001",
      petPostId: "pet-001",
      goalType: "medical",
      targetAmount: 5000,
      currentAmount: 2500,
      description: "ค่ารักษาพยาบาล",
      deadline: new Date("2026-12-31"),
      isActive: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date(),
    };
  }

  // ============================================================
  // DONOR OPERATIONS (Mock)
  // ============================================================

  async getDonorTotal(
    donorId: string,
  ): Promise<{ count: number; amount: number }> {
    const donorDonations = this.donations.filter(
      (d) => d.donorId === donorId && d.paymentStatus === "completed",
    );
    return {
      count: donorDonations.length,
      amount: donorDonations.reduce((sum, d) => sum + d.amount, 0),
    };
  }

  async hasDonatedThisMonth(donorId: string): Promise<boolean> {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    return this.donations.some((d) => {
      if (d.donorId !== donorId || d.paymentStatus !== "completed")
        return false;
      const dDate = new Date(d.createdAt);
      return dDate.getMonth() === thisMonth && dDate.getFullYear() === thisYear;
    });
  }

  async getTodayDonations(
    donorId: string,
  ): Promise<{ points_awarded: number }[]> {
    const today = new Date().toISOString().split("T")[0];

    return this.donations
      .filter((d) => {
        if (d.donorId !== donorId || d.paymentStatus !== "completed")
          return false;
        const dDate = new Date(d.createdAt);
        return dDate.toISOString().startsWith(today);
      })
      .map((d) => ({ points_awarded: d.pointsAwarded }));
  }

  async awardBadges(): Promise<void> {
    // Mock - no-op
    return;
  }

  // Helper methods for testing
  setLeaderboard(entries: DonationLeaderboardEntry[]): void {
    this.leaderboard = entries;
  }

  setStats(newStats: DonationStats): void {
    this.stats = newStats;
  }

  reset(): void {
    this.donations = [...MOCK_DONATIONS];
    this.leaderboard = [...MOCK_LEADERBOARD];
    this.stats = { ...MOCK_STATS };
  }
}
