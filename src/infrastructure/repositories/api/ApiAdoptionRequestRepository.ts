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
  CreateAdoptionRequestPayload,
  IAdoptionRequestRepository,
} from "@/application/repositories/IAdoptionRequestRepository";

export class ApiAdoptionRequestRepository implements IAdoptionRequestRepository {
  private baseUrl = "/api/adoption-requests";

  async create(payload: CreateAdoptionRequestPayload): Promise<AdoptionRequest> {
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

  async getByPostId(petPostId: string): Promise<AdoptionRequest[]> {
    const res = await fetch(`${this.baseUrl}?petPostId=${petPostId}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดคำขอได้");
    }

    return res.json();
  }

  async getMyRequests(): Promise<AdoptionRequest[]> {
    const res = await fetch(`${this.baseUrl}/my-requests`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดคำขอของคุณได้");
    }

    return res.json();
  }

  async hasRequested(petPostId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/has-requested?petPostId=${petPostId}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถตรวจสอบสถานะได้");
    }

    const data = await res.json();
    return data.hasRequested;
  }
}
