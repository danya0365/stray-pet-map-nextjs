/**
 * ApiAdoptionRequestRepository
 * Implements IAdoptionRequestRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  AdoptionRequest,
  AdoptionRequestQueryResult,
  CreateAdoptionRequestPayload,
  IAdoptionRequestRepository,
} from "@/application/repositories/IAdoptionRequestRepository";
import type { PaginationMode } from "@/application/repositories/IPetPostRepository";

export class ApiAdoptionRequestRepository implements IAdoptionRequestRepository {
  private baseUrl = "/api/adoption-requests";

  async create(
    payload: CreateAdoptionRequestPayload,
  ): Promise<AdoptionRequest> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถส่งคำขอรับเลี้ยงได้");
    }

    return res.json();
  }

  async getByPostId(
    petPostId: string,
    pagination: PaginationMode,
  ): Promise<AdoptionRequestQueryResult> {
    const params = new URLSearchParams({ petPostId });

    // Add pagination params
    if (pagination.type === "offset") {
      params.set("paginationType", "offset");
      params.set("page", pagination.page.toString());
      params.set("perPage", pagination.perPage.toString());
    } else {
      params.set("paginationType", "cursor");
      if (pagination.cursor) {
        params.set("cursor", pagination.cursor);
      }
      params.set("limit", pagination.limit.toString());
    }

    const res = await fetch(`${this.baseUrl}?${params}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดคำขอได้");
    }

    return res.json();
  }

  async getMyRequests(
    pagination: PaginationMode,
  ): Promise<AdoptionRequestQueryResult> {
    const params = new URLSearchParams();

    // Add pagination params
    if (pagination.type === "offset") {
      params.set("paginationType", "offset");
      params.set("page", pagination.page.toString());
      params.set("perPage", pagination.perPage.toString());
    } else {
      params.set("paginationType", "cursor");
      if (pagination.cursor) {
        params.set("cursor", pagination.cursor);
      }
      params.set("limit", pagination.limit.toString());
    }

    const res = await fetch(`${this.baseUrl}/my-requests?${params}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดคำขอของคุณได้");
    }

    return res.json();
  }

  async hasRequested(petPostId: string): Promise<boolean> {
    const res = await fetch(
      `${this.baseUrl}/has-requested?petPostId=${petPostId}`,
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถตรวจสอบสถานะได้");
    }

    const data = await res.json();
    return data.hasRequested;
  }
}
