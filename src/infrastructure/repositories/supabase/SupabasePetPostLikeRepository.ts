/**
 * SupabasePetPostLikeRepository
 * Supabase implementation of IPetPostLikeRepository
 * Following Clean Architecture — Infrastructure layer
 */

import type { IPetPostLikeRepository } from "@/application/repositories/IPetPostLikeRepository";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabasePetPostLikeRepository implements IPetPostLikeRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async isLiked(petPostId: string): Promise<boolean> {
    const { data: profileId, error: rpcError } = await this.supabase.rpc(
      "get_active_profile_id",
    );
    if (rpcError || !profileId) return false;

    const { count } = await this.supabase
      .from("pet_post_likes")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("pet_post_id", petPostId);

    return (count ?? 0) > 0;
  }

  async getLikeCount(petPostId: string): Promise<number> {
    const { count } = await this.supabase
      .from("pet_post_likes")
      .select("id", { count: "exact", head: true })
      .eq("pet_post_id", petPostId);

    return count ?? 0;
  }

  async toggleLike(petPostId: string): Promise<boolean> {
    const { data: profileId, error: rpcError } = await this.supabase.rpc(
      "get_active_profile_id",
    );
    if (rpcError || !profileId) {
      throw new Error("กรุณาเข้าสู่ระบบก่อน");
    }

    const { count } = await this.supabase
      .from("pet_post_likes")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("pet_post_id", petPostId);

    const isLiked = (count ?? 0) > 0;

    if (isLiked) {
      const { error } = await this.supabase
        .from("pet_post_likes")
        .delete()
        .eq("profile_id", profileId)
        .eq("pet_post_id", petPostId);

      if (error) {
        throw new Error(`Failed to unlike post: ${error.message}`);
      }
      return false;
    } else {
      const { error } = await this.supabase.from("pet_post_likes").insert({
        profile_id: profileId,
        pet_post_id: petPostId,
      });

      if (error) {
        throw new Error(`Failed to like post: ${error.message}`);
      }
      return true;
    }
  }
}
