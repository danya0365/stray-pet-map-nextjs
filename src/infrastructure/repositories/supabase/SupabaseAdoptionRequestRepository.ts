import type {
  AdoptionRequest,
  AdoptionRequestQueryResult,
  AdoptionRequestStatus,
  CreateAdoptionRequestPayload,
  IAdoptionRequestRepository,
} from "@/application/repositories/IAdoptionRequestRepository";
import type { PaginationMode } from "@/domain/types/pagination";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Type from Supabase schema
type AdoptionRequestRow =
  Database["public"]["Tables"]["adoption_requests"]["Row"];

export class SupabaseAdoptionRequestRepository implements IAdoptionRequestRepository {
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

  async getByPostId(
    petPostId: string,
    pagination: PaginationMode,
  ): Promise<AdoptionRequestQueryResult> {
    let query = this.supabase
      .from("adoption_requests")
      .select("*", { count: "exact" })
      .eq("pet_post_id", petPostId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    let data: AdoptionRequestRow[] = [];
    let total = 0;
    let hasMore = false;
    let nextCursor: string | undefined;
    let page: number | undefined;
    let perPage: number | undefined;

    if (pagination.type === "offset") {
      // Offset pagination (for admin)
      const offset = (pagination.page - 1) * pagination.perPage;
      query = query.range(offset, offset + pagination.perPage - 1);

      const result = await query;
      data = (result.data as AdoptionRequestRow[]) ?? [];
      total = result.count ?? 0;
      hasMore = offset + data.length < total;
      page = pagination.page;
      perPage = pagination.perPage;
    } else {
      // Cursor pagination (for frontend load more)
      const limit = pagination.limit;

      if (pagination.cursor) {
        query = query.lt("created_at", this.decodeCursor(pagination.cursor));
      }

      query = query.limit(limit + 1); // Fetch one extra to check hasMore

      const result = await query;
      const allData = (result.data as AdoptionRequestRow[]) ?? [];
      data = allData.slice(0, limit);
      hasMore = allData.length > limit;
      nextCursor =
        hasMore && data.length > 0 && data[data.length - 1].created_at
          ? this.encodeCursor(data[data.length - 1].created_at!)
          : undefined;
      total = result.count ?? 0;
    }

    return {
      data: data.map(this.mapToDomain),
      total,
      page,
      perPage,
      nextCursor,
      hasMore,
    };
  }

  async getMyRequests(
    pagination: PaginationMode,
  ): Promise<AdoptionRequestQueryResult> {
    const profileId = await this.getProfileId();

    let query = this.supabase
      .from("adoption_requests")
      .select("*", { count: "exact" })
      .eq("requester_profile_id", profileId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    let data: AdoptionRequestRow[] = [];
    let total = 0;
    let hasMore = false;
    let nextCursor: string | undefined;
    let page: number | undefined;
    let perPage: number | undefined;

    if (pagination.type === "offset") {
      // Offset pagination (for admin)
      const offset = (pagination.page - 1) * pagination.perPage;
      query = query.range(offset, offset + pagination.perPage - 1);

      const result = await query;
      data = (result.data as AdoptionRequestRow[]) ?? [];
      total = result.count ?? 0;
      hasMore = offset + data.length < total;
      page = pagination.page;
      perPage = pagination.perPage;
    } else {
      // Cursor pagination (for frontend load more)
      const limit = pagination.limit;

      if (pagination.cursor) {
        query = query.lt("created_at", this.decodeCursor(pagination.cursor));
      }

      query = query.limit(limit + 1); // Fetch one extra to check hasMore

      const result = await query;
      const allData = (result.data as AdoptionRequestRow[]) ?? [];
      data = allData.slice(0, limit);
      hasMore = allData.length > limit;
      nextCursor =
        hasMore && data.length > 0 && data[data.length - 1].created_at
          ? this.encodeCursor(data[data.length - 1].created_at!)
          : undefined;
      total = result.count ?? 0;
    }

    return {
      data: data.map(this.mapToDomain),
      total,
      page,
      perPage,
      nextCursor,
      hasMore,
    };
  }

  private encodeCursor(timestamp: string): string {
    return Buffer.from(timestamp).toString("base64");
  }

  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, "base64").toString("ascii");
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

  async updateStatus(
    id: string,
    status: Exclude<AdoptionRequestStatus, "pending">,
  ): Promise<AdoptionRequest> {
    const profileId = await this.getProfileId();

    // Verify this user owns the post associated with this request
    const { data: requestRow, error: requestError } = await this.supabase
      .from("adoption_requests")
      .select("pet_post_id")
      .eq("id", id)
      .single();

    if (requestError || !requestRow) {
      throw new Error("ไม่พบคำขอรับเลี้ยง");
    }

    // Check ownership of the pet post
    const { data: postRow, error: postError } = await this.supabase
      .from("pet_posts")
      .select("profile_id")
      .eq("id", requestRow.pet_post_id)
      .single();

    if (postError || !postRow || postRow.profile_id !== profileId) {
      throw new Error("คุณไม่ใช่เจ้าของโพสต์นี้");
    }

    // Update request status
    const { data, error } = await this.supabase
      .from("adoption_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error("ไม่สามารถอัปเดตสถานะได้");
    }

    // If approved, auto-close the post
    if (status === "approved") {
      const { error: closeError } = await this.supabase
        .from("pet_posts")
        .update({
          status: "adopted",
          outcome: "rehomed",
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestRow.pet_post_id);

      if (closeError) {
        console.error("Auto-close post after approve failed:", closeError);
        // Don't throw — the request is already approved; log for monitoring
      }
    }

    return this.mapToDomain(data);
  }

  private mapToDomain(row: AdoptionRequestRow): AdoptionRequest {
    return {
      id: row.id,
      petPostId: row.pet_post_id,
      requesterProfileId: row.requester_profile_id,
      message: row.message ?? "",
      contactPhone: row.contact_phone ?? "",
      contactLineId: row.contact_line_id ?? "",
      status: row.status as "pending" | "approved" | "rejected",
      createdAt: row.created_at ?? new Date().toISOString(),
    };
  }
}
