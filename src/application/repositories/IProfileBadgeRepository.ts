import type {
  Badge,
  BadgeProgress,
  BadgeTier,
  BadgeType,
  ProfileWithBadges,
} from "@/domain/entities/badge";

/**
 * IProfileBadgeRepository
 * Repository interface for fetching current user's badges
 * ✅ Designed for client-side where active profile is auto-detected
 * ✅ No profileId parameter needed - API determines from auth session
 */
export interface IProfileBadgeRepository {
  /**
   * Get badges for the currently active profile
   */
  getBadges(): Promise<Badge[]>;

  /**
   * Get current profile with badges
   */
  getCurrentProfileWithBadges(): Promise<ProfileWithBadges | null>;

  /**
   * Get badge progress for current profile
   */
  getProgress(): Promise<BadgeProgress[]>;

  /**
   * Check if current profile has specific badge
   */
  hasBadge(type: BadgeType, tier?: BadgeTier): Promise<boolean>;

  /**
   * Award badge to current profile
   */
  awardBadge(
    type: BadgeType,
    tier: string,
    earnedValue?: number,
  ): Promise<Badge>;

  /**
   * Calculate and update badge progress for current profile
   */
  calculateProgress(): Promise<BadgeProgress[]>;
}
