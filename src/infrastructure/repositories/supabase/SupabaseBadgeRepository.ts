import type { IBadgeRepository } from "@/application/repositories/IBadgeRepository";
import type {
  Badge,
  BadgeProgress,
  BadgeTier,
  BadgeType,
  ProfileWithBadges,
} from "@/domain/entities/badge";
import { BADGE_DEFINITIONS, TIER_REQUIREMENTS } from "@/domain/entities/badge";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type BadgeRow = Database["public"]["Tables"]["profile_badges"]["Row"];

export class SupabaseBadgeRepository implements IBadgeRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getByProfileId(profileId: string): Promise<Badge[]> {
    const { data, error } = await this.supabase
      .from("profile_badges")
      .select("*")
      .eq("profile_id", profileId)
      .order("awarded_at", { ascending: false });

    if (error) {
      console.error("Error fetching badges:", error);
      throw error;
    }

    return (data || []).map((row) => this.mapToDomain(row));
  }

  async getProfileWithBadges(
    profileId: string,
  ): Promise<ProfileWithBadges | null> {
    // ดึงข้อมูล profile
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return null;
    }

    // ดึง badges
    const badges = await this.getByProfileId(profileId);

    // ดึง progress
    const progress = await this.calculateProgress(profileId);

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
    profileId: string,
    type: BadgeType,
    tier: BadgeTier,
    earnedValue?: number,
  ): Promise<Badge> {
    const definition = BADGE_DEFINITIONS[type];

    const { data, error } = await this.supabase
      .from("profile_badges")
      .insert({
        profile_id: profileId,
        type,
        tier,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        color: definition.color,
        earned_value: earnedValue ?? null,
        awarded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // ถ้าเป็น duplicate (มี badge นี้อยู่แล้ว) ให้ return badge ที่มีอยู่
      if (error.code === "23505") {
        const existing = await this.getByProfileId(profileId);
        const found = existing.find((b) => b.type === type && b.tier === tier);
        if (found) return found;
      }
      console.error("Error awarding badge:", error);
      throw error;
    }

    return this.mapToDomain(data);
  }

  async hasBadge(
    profileId: string,
    type: BadgeType,
    tier?: BadgeTier,
  ): Promise<boolean> {
    let query = this.supabase
      .from("profile_badges")
      .select("id")
      .eq("profile_id", profileId)
      .eq("type", type);

    if (tier) {
      query = query.eq("tier", tier);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking badge:", error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  }

  async getLeaderboard(limit = 10): Promise<ProfileWithBadges[]> {
    // ดึงรายการ profile ที่มี badges มากที่สุด
    const { data, error } = await this.supabase
      .from("profile_badge_counts")
      .select("profile_id, badge_count, display_name, avatar_url")
      .order("badge_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }

    // ดึง badges แยกสำหรับแต่ละ profile
    const results: ProfileWithBadges[] = [];
    for (const row of data || []) {
      if (!row.profile_id) continue;
      const badges = await this.getByProfileId(row.profile_id);
      const progress = await this.calculateProgress(row.profile_id);

      results.push({
        profileId: row.profile_id,
        displayName: row.display_name ?? "Anonymous",
        avatarUrl: row.avatar_url ?? undefined,
        badges,
        totalBadges: row.badge_count ?? 0,
        recentBadges: badges.slice(0, 3),
        progress,
      });
    }

    return results;
  }

  async getProgress(profileId: string): Promise<BadgeProgress[]> {
    return this.calculateProgress(profileId);
  }

  async calculateProgress(profileId: string): Promise<BadgeProgress[]> {
    const progress: BadgeProgress[] = [];

    // ดึงสถิติจาก pet_posts
    const { data: stats, error } = await this.supabase
      .from("profile_post_stats")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (ไม่มีข้อมูล)
      console.error("Error fetching stats:", error);
    }

    const postCount = stats?.total_posts ?? 0;
    const successfulAdoptions = stats?.successful_adoptions ?? 0;
    const foundOwners = stats?.found_owners ?? 0;
    const communityCats = stats?.community_cats ?? 0;

    // คำนวณ progress สำหรับแต่ละ badge type
    const badgeTypes: BadgeType[] = [
      "successful_adoption",
      "pet_finder",
      "rescue_hero",
      "active_helper",
      "super_helper",
    ];

    for (const type of badgeTypes) {
      let current = 0;
      switch (type) {
        case "successful_adoption":
          current = successfulAdoptions;
          break;
        case "pet_finder":
          current = foundOwners;
          break;
        case "rescue_hero":
          current = communityCats;
          break;
        case "active_helper":
        case "super_helper":
          current = postCount;
          break;
      }

      const requirements = TIER_REQUIREMENTS[type];
      const tiers: BadgeTier[] = ["bronze", "silver", "gold", "platinum"];
      let nextTier: BadgeTier | undefined;
      let target = 0;

      for (const tier of tiers) {
        const req = requirements[tier];
        if (req > 0 && current < req) {
          nextTier = tier;
          target = req;
          break;
        }
      }

      if (target > 0) {
        progress.push({
          type,
          current,
          target,
          percentage: Math.min(100, Math.round((current / target) * 100)),
          nextTier,
        });
      }
    }

    return progress;
  }

  private mapToDomain(row: BadgeRow): Badge {
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
