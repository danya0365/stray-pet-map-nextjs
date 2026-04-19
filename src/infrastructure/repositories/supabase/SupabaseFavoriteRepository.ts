import type {
  FavoriteQueryResult,
  IFavoriteRepository,
} from "@/application/repositories/IFavoriteRepository";
import type { PaginationMode } from "@/domain/types/pagination";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private async getProfileId(): Promise<string> {
    const { data, error } = await this.supabase.rpc("get_active_profile_id");
    if (error || !data) {
      throw new Error("กรุณาเข้าสู่ระบบก่อน");
    }
    return data as string;
  }

  async isFavorited(petPostId: string): Promise<boolean> {
    const profileId = await this.getProfileId();

    const { count } = await this.supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("pet_post_id", petPostId);

    return (count ?? 0) > 0;
  }

  async getFavoritePostIds(
    pagination?: PaginationMode,
  ): Promise<FavoriteQueryResult> {
    const profileId = await this.getProfileId();

    // Base query
    let query = this.supabase
      .from("favorites")
      .select("pet_post_id, created_at", { count: "exact" })
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    const isPaginated = pagination && pagination.type;

    if (isPaginated && pagination.type === "offset") {
      // Offset pagination (for admin)
      const { page, perPage } = pagination;
      const offset = (page - 1) * perPage;

      const { data, error, count } = await query.range(
        offset,
        offset + perPage - 1,
      );

      if (error) {
        console.error("Error fetching favorites:", error);
        return { postIds: [], total: 0, hasMore: false, page, perPage };
      }

      const postIds = (data ?? []).map((f) => f.pet_post_id);
      const total = count ?? 0;
      const hasMore = offset + postIds.length < total;

      return { postIds, total, hasMore, page, perPage };
    } else if (isPaginated && pagination.type === "cursor") {
      // Cursor pagination (for frontend load more)
      const { cursor, limit = 20 } = pagination;

      if (cursor) {
        const decodedCursor = this.decodeCursor(cursor);
        query = query.lt("created_at", decodedCursor);
      }

      // Fetch one extra to determine hasMore
      const { data, error, count } = await query.limit(limit + 1);

      if (error) {
        console.error("Error fetching favorites:", error);
        return { postIds: [], total: 0, hasMore: false, nextCursor: null };
      }

      const slicedData = (data ?? []).slice(0, limit);
      const postIds = slicedData.map((f) => f.pet_post_id);
      const total = count ?? 0;
      const hasMore = (data ?? []).length > limit;

      let nextCursor: string | null = null;
      if (hasMore && slicedData.length > 0) {
        const lastCreatedAt = slicedData[slicedData.length - 1].created_at;
        if (lastCreatedAt) {
          nextCursor = this.encodeCursor(lastCreatedAt);
        }
      }

      return { postIds, total, hasMore, nextCursor };
    } else {
      // No pagination - fetch all (backward compatibility)
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching favorites:", error);
        return { postIds: [], total: 0, hasMore: false };
      }

      const postIds = (data ?? []).map((f) => f.pet_post_id);
      const total = count ?? 0;

      return { postIds, total, hasMore: false };
    }
  }

  // Helper: Encode cursor
  private encodeCursor(createdAt: string): string {
    return Buffer.from(createdAt).toString("base64url");
  }

  // Helper: Decode cursor
  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, "base64url").toString("utf-8");
  }

  async addFavorite(petPostId: string): Promise<void> {
    const profileId = await this.getProfileId();

    const { error } = await this.supabase.from("favorites").insert({
      profile_id: profileId,
      pet_post_id: petPostId,
    });

    // Ignore duplicate
    if (error && error.code !== "23505") throw error;
  }

  async removeFavorite(petPostId: string): Promise<void> {
    const profileId = await this.getProfileId();

    await this.supabase
      .from("favorites")
      .delete()
      .eq("profile_id", profileId)
      .eq("pet_post_id", petPostId);
  }

  async toggleFavorite(petPostId: string): Promise<boolean> {
    const isFav = await this.isFavorited(petPostId);
    if (isFav) {
      await this.removeFavorite(petPostId);
      return false;
    } else {
      await this.addFavorite(petPostId);
      return true;
    }
  }
}
