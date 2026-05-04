/**
 * BadgePresenter
 * Handles business logic for badge operations
 * Receives repositories via dependency injection
 * Following Clean Architecture pattern
 */

import type { IBadgeRepository } from "@/application/repositories/IBadgeRepository";
import type { IProfileBadgeRepository } from "@/application/repositories/IProfileBadgeRepository";
import type { ProfileWithBadges, Badge, BadgeProgress } from "@/domain/entities/badge";

export interface LeaderboardResult {
  success: boolean;
  leaderboard?: ProfileWithBadges[];
  error?: string;
}

export interface ProfileBadgesResult {
  success: boolean;
  profileId?: string;
  displayName?: string;
  badges?: Badge[];
  totalBadges?: number;
  progress?: BadgeProgress[];
  error?: string;
}

export interface UpdateBadgesResult {
  success: boolean;
  newlyAwarded?: { badge_name: string; badge_tier: string }[];
  totalBadges?: number;
  badges?: Badge[];
  progress?: BadgeProgress[];
  error?: string;
}

/**
 * Presenter for badge operations
 * ✅ Receives repositories via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class BadgePresenter {
  constructor(
    private readonly badgeRepo: IBadgeRepository,
    private readonly profileBadgeRepo: IProfileBadgeRepository
  ) {}

  // ============================================================
  // LEADERBOARD METHODS (For API Routes)
  // ============================================================

  /**
   * Get badge leaderboard
   * Used by /api/badges GET route
   */
  async getLeaderboard(limit = 10): Promise<LeaderboardResult> {
    try {
      const leaderboard = await this.badgeRepo.getLeaderboard(limit);
      return { success: true, leaderboard };
    } catch (error) {
      console.error("Error fetching badge leaderboard:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch leaderboard";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // PROFILE BADGE METHODS (For API Routes)
  // ============================================================

  /**
   * Get current user's badges and progress
   * Used by /api/badges/profile GET route
   */
  async getMyBadges(): Promise<ProfileBadgesResult> {
    try {
      const profileWithBadges = await this.profileBadgeRepo.getCurrentProfileWithBadges();
      
      if (!profileWithBadges) {
        return { success: false, error: "Profile not found" };
      }

      return {
        success: true,
        profileId: profileWithBadges.profileId,
        displayName: profileWithBadges.displayName,
        badges: profileWithBadges.badges,
        totalBadges: profileWithBadges.totalBadges,
        progress: profileWithBadges.progress,
      };
    } catch (error) {
      console.error("Error fetching profile badges:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch badges";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check and award badges, then return updated badges
   * Used by /api/badges/profile POST route
   */
  async checkAndAwardBadges(): Promise<UpdateBadgesResult> {
    try {
      // Check and award new badges
      const newlyAwarded = await this.profileBadgeRepo.checkAndAwardBadges();

      // Get updated badges and progress
      const [badges, progress] = await Promise.all([
        this.profileBadgeRepo.getBadges(),
        this.profileBadgeRepo.getProgress(),
      ]);

      return {
        success: true,
        newlyAwarded: newlyAwarded || [],
        totalBadges: badges.length,
        badges,
        progress,
      };
    } catch (error) {
      console.error("Error updating badges:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update badges";
      return { success: false, error: errorMessage };
    }
  }
}
