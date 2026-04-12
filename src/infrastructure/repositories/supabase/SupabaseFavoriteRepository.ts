import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/domain/types/supabase";
import type { IFavoriteRepository } from "@/application/repositories/IFavoriteRepository";

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

  async getFavoritePostIds(): Promise<string[]> {
    const profileId = await this.getProfileId();

    const { data } = await this.supabase
      .from("favorites")
      .select("pet_post_id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    return (data ?? []).map((f) => f.pet_post_id);
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
