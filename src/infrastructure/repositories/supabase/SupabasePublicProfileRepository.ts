import type { IPublicProfileRepository } from "@/application/repositories/IPublicProfileRepository";
import type { Badge, BadgeProgress, BadgeType } from "@/domain/entities/badge";
import type { PetPost } from "@/domain/entities/pet-post";
import type {
  PublicProfile,
  PublicProfileStats,
  PublicProfileSummary,
  PublicProfileWithPosts,
} from "@/domain/entities/public-profile";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SupabasePublicProfileRepository
 * Server-side implementation สำหรับดึง public profile data
 * ✅ ไม่ต้อง authentication
 * ✅ กรอง sensitive data ออกโดยอัตโนมัติ
 */
export class SupabasePublicProfileRepository implements IPublicProfileRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getById(profileId: string): Promise<PublicProfile | null> {
    // ดึง profile basic info
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select(
        "id, username, full_name, avatar_url, bio, created_at, verification_status",
      )
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching public profile:", profileError);
      return null;
    }

    // ดึง badges
    const badges = await this.getBadges(profileId);

    // ดึง badge progress
    const badgeProgress = await this.calculateProgress(profileId);

    // ดึง stats
    const stats = await this.getStats(profileId, badges.length);

    return {
      id: profile.id,
      displayName: profile.full_name ?? profile.username ?? "Anonymous",
      username: profile.username ?? undefined,
      avatarUrl: profile.avatar_url ?? undefined,
      bio: profile.bio ?? undefined,
      badges,
      badgeProgress,
      stats,
      joinedAt: profile.created_at ?? new Date().toISOString(),
      isVerified: profile.verification_status === "verified",
    };
  }

  async getByIdWithPosts(
    profileId: string,
  ): Promise<PublicProfileWithPosts | null> {
    const [profile, postsResult] = await Promise.all([
      this.getById(profileId),
      this.getPosts(profileId, 1, 100), // ดึง posts แรก 100 โพสต์
    ]);

    if (!profile) return null;

    return {
      ...profile,
      posts: postsResult.posts,
    };
  }

  async getPosts(
    profileId: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<{
    posts: PetPost[];
    total: number;
    hasMore: boolean;
  }> {
    const offset = (page - 1) * perPage;

    // ดึงโพสต์ที่ public เท่านั้น (ไม่ดึง archived)
    const {
      data: posts,
      error,
      count,
    } = await this.supabase
      .from("pet_posts")
      .select(
        `*,
        pet_types(id, name, slug, icon, sort_order, is_active)
      `,
        { count: "exact" },
      )
      .eq("profile_id", profileId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) {
      console.error("Error fetching public posts:", error);
      return { posts: [], total: 0, hasMore: false };
    }

    const mappedPosts: PetPost[] = (posts || []).map((post) => ({
      id: post.id,
      profileId: post.profile_id,
      petTypeId: post.pet_type_id,
      petType: post.pet_types
        ? {
            id: (post.pet_types as { id: string }).id,
            name: (post.pet_types as { name: string }).name,
            slug: (post.pet_types as { slug: string }).slug,
            icon: (post.pet_types as { icon: string | null }).icon ?? "Paw",
            sortOrder: (post.pet_types as { sort_order: number }).sort_order,
            isActive: (post.pet_types as { is_active: boolean }).is_active,
          }
        : undefined,
      title: post.title ?? "",
      description: post.description ?? "",
      breed: post.breed ?? "",
      color: post.color ?? "",
      gender: post.gender as PetPost["gender"],
      estimatedAge: post.estimated_age ?? "",
      isVaccinated: post.is_vaccinated,
      isNeutered: post.is_neutered,
      latitude: post.latitude,
      longitude: post.longitude,
      address: post.address ?? "",
      province: post.province ?? "",
      purpose: post.purpose as PetPost["purpose"],
      status: post.status as PetPost["status"],
      outcome: post.outcome as PetPost["outcome"] | null,
      resolvedAt: post.resolved_at,
      thumbnailUrl: post.thumbnail_url ?? "",
      isActive: post.is_active,
      isArchived: post.is_archived,
      createdAt: post.created_at ?? new Date().toISOString(),
      updatedAt: post.updated_at ?? new Date().toISOString(),
    }));

    const total = count ?? 0;
    const hasMore = offset + mappedPosts.length < total;

    return { posts: mappedPosts, total, hasMore };
  }

  async getTopProfiles(limit: number = 10): Promise<PublicProfileSummary[]> {
    // ดึง profiles ที่มี badges มากที่สุดจาก view
    const { data, error } = await this.supabase
      .from("profile_badge_counts")
      .select("profile_id, badge_count")
      .order("badge_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top profiles:", error);
      return [];
    }

    // ดึง profile details แยก
    const profileIds = (data || [])
      .map((row) => row.profile_id)
      .filter((id): id is string => !!id);
    if (profileIds.length === 0) return [];

    const { data: profiles } = await this.supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", profileIds);

    // ดึง helped count จาก stats
    const { data: stats } = await this.supabase
      .from("profile_post_stats")
      .select("profile_id, successful_adoptions, found_owners")
      .in("profile_id", profileIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
    const statsMap = new Map(stats?.map((s) => [s.profile_id, s]) ?? []);

    return (data || []).map((row) => {
      const profileId = row.profile_id!; // กรอง null แล้วด้านบน
      const profile = profileMap.get(profileId);
      const stat = statsMap.get(profileId);
      const helpedCount =
        (stat?.successful_adoptions ?? 0) + (stat?.found_owners ?? 0);

      return {
        id: profileId,
        displayName: profile?.full_name ?? "Anonymous",
        avatarUrl: profile?.avatar_url ?? undefined,
        totalBadges: row.badge_count ?? 0,
        helpedCount,
      };
    });
  }

  async exists(profileId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .single();

    return !error && !!data;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async getBadges(profileId: string): Promise<Badge[]> {
    const { data, error } = await this.supabase
      .from("profile_badges")
      .select("*")
      .eq("profile_id", profileId)
      .order("awarded_at", { ascending: false });

    if (error) {
      console.error("Error fetching badges:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      profileId: row.profile_id,
      type: row.type as Badge["type"],
      tier: row.tier as Badge["tier"],
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      awardedAt: row.awarded_at,
      earnedValue: row.earned_value ?? undefined,
    }));
  }

  private async calculateProgress(profileId: string): Promise<BadgeProgress[]> {
    // Get stats from view
    const { data: stats, error } = await this.supabase
      .from("profile_post_stats")
      .select("*")
      .eq("profile_id", profileId)
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

  private async getStats(
    profileId: string,
    totalBadges: number = 0,
  ): Promise<PublicProfileStats> {
    // Get from stats view
    const { data: stats, error } = await this.supabase
      .from("profile_post_stats")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching stats:", error);
    }

    // Count total posts
    const { count: totalPosts } = await this.supabase
      .from("pet_posts")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId);

    const helpedCount =
      (stats?.successful_adoptions ?? 0) + (stats?.found_owners ?? 0);

    return {
      totalPosts: totalPosts ?? 0,
      helpedCount,
      totalBadges,
    };
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
    const requirements: Record<BadgeType, Record<string, number>> = {
      successful_adoption: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      pet_finder: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      rescue_hero: { bronze: 3, silver: 10, gold: 25, platinum: 50 },
      active_helper: { bronze: 5, silver: 15, gold: 30, platinum: 50 },
      super_helper: { bronze: 10, silver: 25, gold: 50, platinum: 100 },
      first_post: { bronze: 1, silver: 10, gold: 25, platinum: 50 },
      quick_responder: { bronze: 1, silver: 5, gold: 15, platinum: 30 },
      verified_rescuer: { bronze: 1, silver: 1, gold: 1, platinum: 1 },
    };

    const tiers = ["bronze", "silver", "gold", "platinum"];
    for (const tier of tiers) {
      const req = requirements[type][tier];
      if (req > 0 && current < req) return req;
    }
    return 0;
  }

  private getNextTier(
    type: BadgeType,
    current: number,
  ): "bronze" | "silver" | "gold" | "platinum" | undefined {
    const requirements: Record<BadgeType, Record<string, number>> = {
      successful_adoption: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      pet_finder: { bronze: 1, silver: 3, gold: 5, platinum: 10 },
      rescue_hero: { bronze: 3, silver: 10, gold: 25, platinum: 50 },
      active_helper: { bronze: 5, silver: 15, gold: 30, platinum: 50 },
      super_helper: { bronze: 10, silver: 25, gold: 50, platinum: 100 },
      first_post: { bronze: 1, silver: 10, gold: 25, platinum: 50 },
      quick_responder: { bronze: 1, silver: 5, gold: 15, platinum: 30 },
      verified_rescuer: { bronze: 1, silver: 1, gold: 1, platinum: 1 },
    };

    const tiers: Array<"bronze" | "silver" | "gold" | "platinum"> = [
      "bronze",
      "silver",
      "gold",
      "platinum",
    ];
    for (const tier of tiers) {
      const req = requirements[type][tier];
      if (req > 0 && current < req) return tier;
    }
    return undefined;
  }
}
