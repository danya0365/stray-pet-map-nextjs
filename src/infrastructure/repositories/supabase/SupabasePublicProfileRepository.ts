import { PaginationMode } from "@/application/repositories/IPetPostRepository";
import type {
  IPublicProfileRepository,
  ProfilePostsQueryResult,
} from "@/application/repositories/IPublicProfileRepository";
import {
  TIER_REQUIREMENTS,
  type Badge,
  type BadgeProgress,
  type BadgeType,
} from "@/domain/entities/badge";
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
      this.getPosts(profileId, { type: "cursor", limit: 100 }), // ดึง posts แรก 100 โพสต์
    ]);

    if (!profile) return null;

    return {
      ...profile,
      posts: postsResult.posts,
    };
  }

  async getPosts(
    profileId: string,
    pagination: PaginationMode,
  ): Promise<ProfilePostsQueryResult> {
    // Base query
    let query = this.supabase
      .from("pet_posts")
      .select(
        `*,
        pet_types(id, name, slug, icon, sort_order, is_active)
      `,
        { count: "exact" },
      )
      .eq("profile_id", profileId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    let posts: unknown[] = [];
    let total = 0;
    let hasMore = false;
    let nextCursor: string | null = null;

    if (pagination.type === "offset") {
      // Offset pagination (for admin)
      const { page, perPage } = pagination;
      const offset = (page - 1) * perPage;

      const { data, error, count } = await query.range(
        offset,
        offset + perPage - 1,
      );

      if (error) {
        console.error("Error fetching public posts:", error);
        return { posts: [], total: 0, hasMore: false, page, perPage };
      }

      posts = data || [];
      total = count ?? 0;
      hasMore = offset + posts.length < total;

      return {
        posts: this.mapPosts(posts),
        total,
        hasMore,
        page,
        perPage,
      };
    } else {
      // Cursor pagination (for frontend load more)
      const { cursor, limit = 20 } = pagination;

      if (cursor) {
        const decodedCursor = this.decodeCursor(cursor);
        query = query.lt("created_at", decodedCursor);
      }

      // Fetch one extra to determine hasMore
      const { data, error, count } = await query.limit(limit + 1);

      if (error) {
        console.error("Error fetching public posts:", error);
        return { posts: [], total: 0, hasMore: false, nextCursor: null };
      }

      posts = (data || []).slice(0, limit);
      total = count ?? 0;
      hasMore = (data || []).length > limit;

      if (hasMore && posts.length > 0) {
        nextCursor = this.encodeCursor(
          (posts[posts.length - 1] as { created_at: string }).created_at,
        );
      }

      return {
        posts: this.mapPosts(posts),
        total,
        hasMore,
        nextCursor,
      };
    }
  }

  // Helper: Map raw posts to PetPost entities
  private mapPosts(posts: unknown[]): PetPost[] {
    return posts.map((post) => ({
      id: (post as { id: string }).id,
      profileId: (post as { profile_id: string }).profile_id,
      petTypeId: (post as { pet_type_id: string }).pet_type_id,
      petType: (post as { pet_types: unknown }).pet_types
        ? {
            id: (post as { pet_types: { id: string } }).pet_types.id,
            name: (post as { pet_types: { name: string } }).pet_types.name,
            slug: (post as { pet_types: { slug: string } }).pet_types.slug,
            icon:
              (post as { pet_types: { icon: string | null } }).pet_types.icon ??
              "Paw",
            sortOrder: (post as { pet_types: { sort_order: number } }).pet_types
              .sort_order,
            isActive: (post as { pet_types: { is_active: boolean } }).pet_types
              .is_active,
          }
        : undefined,
      title: (post as { title: string | null }).title ?? "",
      description: (post as { description: string | null }).description ?? "",
      breed: (post as { breed: string | null }).breed ?? "",
      color: (post as { color: string | null }).color ?? "",
      gender: (post as { gender: string }).gender as PetPost["gender"],
      estimatedAge:
        (post as { estimated_age: string | null }).estimated_age ?? "",
      isVaccinated: (post as { is_vaccinated: boolean }).is_vaccinated,
      isNeutered: (post as { is_neutered: boolean }).is_neutered,
      latitude: (post as { latitude: number | null }).latitude ?? 0,
      longitude: (post as { longitude: number | null }).longitude ?? 0,
      address: (post as { address: string | null }).address ?? "",
      province: (post as { province: string | null }).province ?? "",
      purpose: (post as { purpose: string }).purpose as PetPost["purpose"],
      status: (post as { status: string }).status as PetPost["status"],
      outcome: (post as { outcome: string | null }).outcome as
        | PetPost["outcome"]
        | null,
      resolvedAt: (post as { resolved_at: string | null }).resolved_at,
      thumbnailUrl:
        (post as { thumbnail_url: string | null }).thumbnail_url ?? "",
      isActive: (post as { is_active: boolean }).is_active,
      isArchived: (post as { is_archived: boolean }).is_archived,
      createdAt:
        (post as { created_at: string }).created_at ?? new Date().toISOString(),
      updatedAt:
        (post as { updated_at: string }).updated_at ?? new Date().toISOString(),
    }));
  }

  // Helper: Encode cursor
  private encodeCursor(createdAt: string): string {
    return Buffer.from(createdAt).toString("base64url");
  }

  // Helper: Decode cursor
  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, "base64url").toString("utf-8");
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
    const tiers = ["bronze", "silver", "gold", "platinum"];
    for (const tier of tiers) {
      const req =
        TIER_REQUIREMENTS[type][
          tier as keyof (typeof TIER_REQUIREMENTS)["first_post"]
        ];
      if (req > 0 && current < req) return req;
    }
    return 0;
  }

  private getNextTier(
    type: BadgeType,
    current: number,
  ): "bronze" | "silver" | "gold" | "platinum" | undefined {
    const tiers: Array<"bronze" | "silver" | "gold" | "platinum"> = [
      "bronze",
      "silver",
      "gold",
      "platinum",
    ];
    for (const tier of tiers) {
      const req =
        TIER_REQUIREMENTS[type][
          tier as keyof (typeof TIER_REQUIREMENTS)["first_post"]
        ];
      if (req > 0 && current < req) return tier;
    }
    return undefined;
  }
}
