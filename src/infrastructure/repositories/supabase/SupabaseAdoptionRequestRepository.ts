import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/domain/types/supabase";
import type {
  AdoptionRequest,
  CreateAdoptionRequestPayload,
  IAdoptionRequestRepository,
} from "@/application/repositories/IAdoptionRequestRepository";

export class SupabaseAdoptionRequestRepository
  implements IAdoptionRequestRepository
{
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private async getProfileId(): Promise<string> {
    const { data, error } = await this.supabase.rpc("get_active_profile_id");
    if (error || !data) throw new Error("กรุณาเข้าสู่ระบบก่อน");
    return data as string;
  }

  async create(
    payload: CreateAdoptionRequestPayload,
  ): Promise<AdoptionRequest> {
    const profileId = await this.getProfileId();

    const { data, error } = await this.supabase
      .from("adoption_requests")
      .insert({
        pet_post_id: payload.petPostId,
        requester_profile_id: profileId,
        message: payload.message ?? "",
        contact_phone: payload.contactPhone ?? "",
        contact_line_id: payload.contactLineId ?? "",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("คุณได้ส่งคำขอรับเลี้ยงน้องตัวนี้ไปแล้ว");
      }
      throw error;
    }

    return this.mapToDomain(data);
  }

  async getByPostId(petPostId: string): Promise<AdoptionRequest[]> {
    const { data } = await this.supabase
      .from("adoption_requests")
      .select("*")
      .eq("pet_post_id", petPostId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return (data ?? []).map(this.mapToDomain);
  }

  async getMyRequests(): Promise<AdoptionRequest[]> {
    const profileId = await this.getProfileId();

    const { data } = await this.supabase
      .from("adoption_requests")
      .select("*")
      .eq("requester_profile_id", profileId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return (data ?? []).map(this.mapToDomain);
  }

  async hasRequested(petPostId: string): Promise<boolean> {
    const profileId = await this.getProfileId();

    const { count } = await this.supabase
      .from("adoption_requests")
      .select("id", { count: "exact", head: true })
      .eq("pet_post_id", petPostId)
      .eq("requester_profile_id", profileId)
      .eq("is_active", true);

    return (count ?? 0) > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(row: any): AdoptionRequest {
    return {
      id: row.id,
      petPostId: row.pet_post_id,
      requesterProfileId: row.requester_profile_id,
      message: row.message,
      contactPhone: row.contact_phone,
      contactLineId: row.contact_line_id,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
