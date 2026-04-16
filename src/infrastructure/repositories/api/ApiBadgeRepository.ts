import type { IProfileBadgeRepository } from "@/application/repositories/IProfileBadgeRepository";
import type {
  Badge,
  BadgeProgress,
  BadgeTier,
  BadgeType,
  ProfileWithBadges,
} from "@/domain/entities/badge";

/**
 * ApiBadgeRepository
 * Client-side implementation for fetching current user's badges
 * ✅ No profileId parameter - API auto-detects from auth session
 * ✅ No direct Supabase connection - avoids connection pool issues
 * ✅ Following Clean Architecture pattern
 */
export class ApiBadgeRepository implements IProfileBadgeRepository {
  async getBadges(): Promise<Badge[]> {
    const res = await fetch("/api/badges/profile");
    if (!res.ok) {
      throw new Error("Failed to fetch badges");
    }
    const data = await res.json();
    return data.badges || [];
  }

  async getCurrentProfileWithBadges(): Promise<ProfileWithBadges | null> {
    const res = await fetch("/api/badges/profile");
    if (!res.ok) {
      throw new Error("Failed to fetch profile with badges");
    }
    const data = await res.json();
    return {
      profileId: data.profileId,
      displayName: data.displayName || "Anonymous",
      avatarUrl: undefined,
      badges: data.badges || [],
      totalBadges: data.totalBadges || 0,
      recentBadges: (data.badges || []).slice(0, 3),
      progress: data.progress || [],
    };
  }

  async awardBadge(
    type: BadgeType,
    tier: string,
    earnedValue?: number,
  ): Promise<Badge> {
    const res = await fetch("/api/badges/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, tier, earnedValue }),
    });
    if (!res.ok) {
      throw new Error("Failed to award badge");
    }
    const data = await res.json();
    return data.newlyAwarded?.[0];
  }

  async hasBadge(type: BadgeType, tier?: BadgeTier): Promise<boolean> {
    const badges = await this.getBadges();
    return badges.some((b) => b.type === type && (!tier || b.tier === tier));
  }

  async getProgress(): Promise<BadgeProgress[]> {
    const res = await fetch("/api/badges/profile");
    if (!res.ok) {
      throw new Error("Failed to fetch badge progress");
    }
    const data = await res.json();
    return data.progress || [];
  }

  async calculateProgress(): Promise<BadgeProgress[]> {
    const res = await fetch("/api/badges/profile", { method: "POST" });
    if (!res.ok) {
      throw new Error("Failed to calculate progress");
    }
    const data = await res.json();
    return data.progress || [];
  }
}
