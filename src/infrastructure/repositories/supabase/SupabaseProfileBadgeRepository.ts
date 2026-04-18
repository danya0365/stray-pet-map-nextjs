import type { IProfileBadgeRepository } from "@/application/repositories/IProfileBadgeRepository";
import type {
  Badge,
  BadgeProgress,
  BadgeTier,
  BadgeType,
  ProfileWithBadges,
} from "@/domain/entities/badge";
import { BADGE_DEFINITIONS } from "@/domain/entities/badge";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SupabaseProfileBadgeRepository
 * Server-side implementation for fetching current user's badges
 * ✅ No profileId parameter - auto-detects from auth session
 * ✅ Following Clean Architecture pattern
 */
export class SupabaseProfileBadgeRepository implements IProfileBadgeRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getBadges(): Promise<Badge[]> {
    const profile = await this.getCurrentProfile();
    if (!profile) return [];

    const { data, error } = await this.supabase
      .from("profile_badges")
      .select("*")
      .eq("profile_id", profile.id)
      .order("awarded_at", { ascending: false });

    if (error) {
      console.error("Error fetching badges:", error);
      return [];
    }

    return (data || []).map((row) => this.mapToDomain(row));
  }

  async getCurrentProfileWithBadges(): Promise<ProfileWithBadges | null> {
    const profile = await this.getCurrentProfile();
    if (!profile) return null;

    // Get badges
    const badges = await this.getBadges();

    // Get progress
    const progress = await this.getProgress();

    return {
      profileId: profile.id,
      displayName: profile.full_name ?? "Anonymous",
      avatarUrl: profile.avatar_url ?? undefined,
      badges,
      totalBadges: badges.length,
      recentBadges: badges.slice(0, 3),
      progress,
    };
  }

  async awardBadge(
    type: BadgeType,
    tier: string,
    earnedValue?: number,
  ): Promise<Badge> {
    const profile = await this.getCurrentProfile();
    if (!profile) throw new Error("No active profile");

    const definition = BADGE_DEFINITIONS[type];

    const { data, error } = await this.supabase
      .from("profile_badges")
      .insert({
        profile_id: profile.id,
        type,
        tier: tier as "bronze" | "silver" | "gold" | "platinum",
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        color: definition.color,
        earned_value: earnedValue ?? null,
        awarded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToDomain(data);
  }

  async hasBadge(type: BadgeType, tier?: BadgeTier): Promise<boolean> {
    const badges = await this.getBadges();
    return badges.some((b) => b.type === type && (!tier || b.tier === tier));
  }

  async getProgress(): Promise<BadgeProgress[]> {
    return this.calculateProgress();
  }

  async checkAndAwardBadges(): Promise<
    { badge_name: string; badge_tier: string }[]
  > {
    const profile = await this.getCurrentProfile();
    if (!profile) throw new Error("No active profile");

    // เรียกฟังก์ชัน RPC เพื่อตรวจสอบและมอบ badges อัตโนมัติ
    const { data, error } = await this.supabase.rpc("check_and_award_badges", {
      target_profile_id: profile.id,
    });

    if (error) {
      console.error("Error checking and awarding badges:", error);
      throw error;
    }

    return data || [];
  }

  async calculateProgress(): Promise<BadgeProgress[]> {
    const profile = await this.getCurrentProfile();
    if (!profile) return [];

    // Get stats from view
    const { data: stats, error } = await this.supabase
      .from("profile_post_stats")
      .select("*")
      .eq("profile_id", profile.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching stats:", error);
    }

    const progress: BadgeProgress[] = [];
    const badgeTypes: BadgeType[] = [
      "successful_adoption",
      "pet_finder",
      "rescue_hero",
      "active_helper",
      "super_helper",
    ];

    for (const type of badgeTypes) {
      const current = this.getCurrentValue(type, stats);
      const target = this.getNextTierTarget(type, current);

      if (target > 0) {
        progress.push({
          type,
          current,
          target,
          percentage: Math.min(100, Math.round((current / target) * 100)),
          nextTier: this.getNextTier(type, current),
        });
      }
    }

    return progress;
  }

  private async getCurrentProfile() {
    // Use RPC to get active profile
    const { data: profile, error } = await this.supabase
      .rpc("get_active_profile")
      .single();

    if (error || !profile) return null;
    return profile;
  }

  private getCurrentValue(
    type: BadgeType,
    stats: {
      total_posts?: number | null;
      successful_adoptions?: number | null;
      found_owners?: number | null;
      community_cats?: number | null;
    } | null,
  ): number {
    if (!stats) return 0;
    switch (type) {
      case "successful_adoption":
        return stats.successful_adoptions ?? 0;
      case "pet_finder":
        return stats.found_owners ?? 0;
      case "rescue_hero":
        return stats.community_cats ?? 0;
      case "active_helper":
      case "super_helper":
        return stats.total_posts ?? 0;
      default:
        return 0;
    }
  }

  private getNextTierTarget(type: BadgeType, current: number): number {
    const tiers: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];
    const requirements: Record<BadgeType, Record<BadgeTier, number>> = {
      successful_adoption: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      pet_finder: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      rescue_hero: { bronze: 3, silver: 10, gold: 25, platinum: 50 },
      active_helper: { bronze: 5, silver: 15, gold: 30, platinum: 50 },
      super_helper: { bronze: 10, silver: 25, gold: 50, platinum: 100 },
      first_post: { bronze: 1, silver: 10, gold: 25, platinum: 50 },
      quick_responder: { bronze: 1, silver: 5, gold: 15, platinum: 30 },
      verified_rescuer: { bronze: 1, silver: 1, gold: 1, platinum: 1 },
    };

    for (const tier of tiers) {
      const req = requirements[type][tier];
      if (req > 0 && current < req) return req;
    }
    return 0;
  }

  private getNextTier(type: BadgeType, current: number): BadgeTier | undefined {
    const tiers: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];
    const requirements: Record<BadgeType, Record<BadgeTier, number>> = {
      successful_adoption: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      pet_finder: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      rescue_hero: { bronze: 3, silver: 10, gold: 25, platinum: 50 },
      active_helper: { bronze: 5, silver: 15, gold: 30, platinum: 50 },
      super_helper: { bronze: 10, silver: 25, gold: 50, platinum: 100 },
      first_post: { bronze: 1, silver: 10, gold: 25, platinum: 50 },
      quick_responder: { bronze: 1, silver: 5, gold: 15, platinum: 30 },
      verified_rescuer: { bronze: 1, silver: 1, gold: 1, platinum: 1 },
    };

    for (const tier of tiers) {
      const req = requirements[type][tier];
      if (req > 0 && current < req) return tier;
    }
    return undefined;
  }

  private mapToDomain(row: {
    id: string;
    profile_id: string;
    type: string;
    tier: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    awarded_at: string;
    earned_value: number | null;
  }): Badge {
    return {
      id: row.id,
      profileId: row.profile_id,
      type: row.type as BadgeType,
      tier: row.tier as BadgeTier,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      awardedAt: row.awarded_at,
      earnedValue: row.earned_value ?? undefined,
    };
  }
}
