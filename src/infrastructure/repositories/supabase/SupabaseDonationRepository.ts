/**
 * SupabaseDonationRepository
 * Supabase implementation for donation CRUD operations
 * Following Clean Architecture - Infrastructure layer
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
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SupabaseDonationRepository
 * Supabase implementation for donation CRUD operations
 * ✅ Receives SupabaseClient via constructor (injected by factory)
 * ✅ Following Clean Architecture - Infrastructure layer
 */
export class SupabaseDonationRepository implements IDonationRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Create a new donation record
   */
  async create(params: CreateDonationParams): Promise<Donation> {
    const { data, error } = await this.supabase
      .from("donations")
      .insert({
        donor_id: params.donorId || null,
        donor_name: params.donorName || "ผู้ใจดี",
        donor_email: params.donorEmail,
        target_type: params.targetType,
        pet_post_id: params.petPostId || null,
        amount: params.amount,
        currency: "THB",
        payment_method: "stripe_promptpay", // Will be updated by webhook
        payment_status: "pending",
        stripe_session_id: params.stripeSessionId,
        message: params.message,
        show_on_leaderboard: params.showOnLeaderboard ?? true,
        points_awarded: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating donation:", error);
      throw error;
    }

    return this.mapToDonation(data);
  }

  /**
   * Find donation by Stripe session ID
   */
  async findByStripeSessionId(sessionId: string): Promise<Donation | null> {
    const { data, error } = await this.supabase
      .from("donations")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (error || !data) return null;
    return this.mapToDonation(data);
  }

  /**
   * Update donation status and award points
   */
  async completeDonation(
    donationId: string,
    paymentIntentId: string,
    points: number,
  ): Promise<Donation> {
    const { data, error } = await this.supabase
      .from("donations")
      .update({
        payment_status: "completed",
        stripe_payment_intent_id: paymentIntentId,
        points_awarded: points,
        completed_at: new Date().toISOString(),
      })
      .eq("id", donationId)
      .select()
      .single();

    if (error) {
      console.error("Error completing donation:", error);
      throw error;
    }

    return this.mapToDonation(data);
  }

  /**
   * Get all-time leaderboard
   */
  async getLeaderboardAllTime(limit = 50): Promise<DonationLeaderboardEntry[]> {
    const { data, error } = await this.supabase
      .from("donation_leaderboard_alltime")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return data.map(this.mapToLeaderboardEntry);
  }

  /**
   * Get weekly leaderboard
   */
  async getLeaderboardWeekly(limit = 10): Promise<DonationLeaderboardEntry[]> {
    const { data, error } = await this.supabase
      .from("donation_leaderboard_weekly")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error fetching weekly leaderboard:", error);
      return [];
    }

    return data.map(this.mapToLeaderboardEntry);
  }

  /**
   * Get donation stats
   */
  async getStats(): Promise<DonationStats> {
    const { data, error } = await this.supabase
      .from("donation_stats")
      .select("*")
      .single();

    if (error || !data) {
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

    return {
      totalDonations: Number(data.total_donations),
      monthlyDonations: Number(data.monthly_donations),
      weeklyDonations: Number(data.weekly_donations),
      totalRaised: Number(data.total_raised),
      monthlyRaised: Number(data.monthly_raised),
      weeklyRaised: Number(data.weekly_raised),
      uniqueDonors: Number(data.unique_donors),
    };
  }

  /**
   * Get recent completed donations for ticker
   */
  async getRecentDonations(limit = 10): Promise<RecentDonation[]> {
    const { data, error } = await this.supabase
      .from("donations")
      .select(
        `
        id,
        donor_name,
        amount,
        target_type,
        message,
        created_at,
        pet_posts:pet_post_id (name)
      `,
      )
      .eq("payment_status", "completed")
      .eq("show_on_leaderboard", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent donations:", error);
      return [];
    }

    return data.map((d: unknown) => ({
      id: (d as { id: string }).id,
      donorName: (d as { donor_name: string }).donor_name,
      amount: Number((d as { amount: number }).amount),
      targetType: (d as { target_type: "pet" | "fund" }).target_type,
      petName: (d as { pet_posts: { name: string } | null }).pet_posts?.name,
      message: (d as { message: string | null }).message || undefined,
      createdAt: new Date((d as { created_at: string }).created_at),
    }));
  }

  /**
   * Get funding goal for a pet post
   */
  async getPetFundingGoal(petPostId: string): Promise<PetFundingGoal | null> {
    const { data, error } = await this.supabase
      .from("pet_post_funding_goals")
      .select("*")
      .eq("pet_post_id", petPostId)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return this.mapToFundingGoal(data);
  }

  /**
   * Get donor's total donations (for gamification)
   */
  async getDonorTotal(
    donorId: string,
  ): Promise<{ count: number; amount: number }> {
    const { data, error } = await this.supabase
      .from("donations")
      .select("amount", { count: "exact" })
      .eq("donor_id", donorId)
      .eq("payment_status", "completed");

    if (error) {
      return { count: 0, amount: 0 };
    }

    const totalAmount = (data || []).reduce(
      (sum: number, d: { amount: number }) => sum + Number(d.amount),
      0,
    );
    return { count: data?.length || 0, amount: totalAmount };
  }

  /**
   * Check if donor has donated this month (for "ผู้อุปถัมภ์" badge)
   */
  async hasDonatedThisMonth(donorId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("donations")
      .select("id")
      .eq("donor_id", donorId)
      .eq("payment_status", "completed")
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toISOString(),
      )
      .limit(1);

    if (error) return false;
    return (data?.length || 0) > 0;
  }

  async getTodayDonations(
    donorId: string,
  ): Promise<{ points_awarded: number }[]> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await this.supabase
      .from("donations")
      .select("points_awarded")
      .eq("donor_id", donorId)
      .gte("created_at", today)
      .lt("created_at", today + "T23:59:59");

    if (error) return [];
    return data || [];
  }

  async awardBadges(donorId: string): Promise<void> {
    await this.supabase.rpc("check_and_award_badges", {
      target_profile_id: donorId,
    });
  }

  // Mappers
  private mapToDonation(data: Record<string, unknown>): Donation {
    return {
      id: data.id as string,
      donorId: data.donor_id as string | null,
      donorName: data.donor_name as string,
      donorEmail: data.donor_email as string | undefined,
      isAnonymous: data.is_anonymous as boolean,
      targetType: data.target_type as "pet" | "fund",
      petPostId: data.pet_post_id as string | null,
      amount: Number(data.amount),
      currency: data.currency as string,
      paymentMethod: data.payment_method as "stripe_promptpay" | "stripe_card",
      paymentStatus: data.payment_status as
        | "pending"
        | "completed"
        | "failed"
        | "refunded",
      stripeSessionId: data.stripe_session_id as string | undefined,
      stripePaymentIntentId: data.stripe_payment_intent_id as
        | string
        | undefined,
      message: data.message as string | undefined,
      showOnLeaderboard: data.show_on_leaderboard as boolean,
      pointsAwarded: Number(data.points_awarded),
      createdAt: new Date(data.created_at as string),
      completedAt: data.completed_at
        ? new Date(data.completed_at as string)
        : undefined,
      updatedAt: new Date(data.updated_at as string),
    };
  }

  private mapToLeaderboardEntry(
    data: Record<string, unknown>,
  ): DonationLeaderboardEntry {
    return {
      donorId: data.donor_id as string,
      donorName: data.donor_name as string,
      avatarUrl: data.avatar_url as string | undefined,
      level: Number(data.level) || 1,
      totalAmount: Number(data.total_amount),
      donationCount: Number(data.donation_count),
      lastDonationAt: data.last_donation_at
        ? new Date(data.last_donation_at as string)
        : undefined,
    };
  }

  private mapToFundingGoal(data: Record<string, unknown>): PetFundingGoal {
    return {
      id: data.id as string,
      petPostId: data.pet_post_id as string,
      goalType: data.goal_type as
        | "medical"
        | "food"
        | "shelter"
        | "transport"
        | "other",
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      description: data.description as string | undefined,
      deadline: data.deadline ? new Date(data.deadline as string) : undefined,
      isActive: data.is_active as boolean,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}
