/**
 * ApiPetPostLikeRepository
 * Implements IPetPostLikeRepository using API calls
 *
 * For use in CLIENT-SIDE components only
 * No Supabase credentials exposed to client
 * Calls go through Next.js API routes
 */

"use client";

import type { IPetPostLikeRepository } from "@/application/repositories/IPetPostLikeRepository";

export class ApiPetPostLikeRepository implements IPetPostLikeRepository {
  private baseUrl = "/api/pet-posts";

  async isLiked(petPostId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${petPostId}/like`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "ไม่สามารถตรวจสอบสถานะถูกใจได้");
    }
    const data = await res.json();
    return data.isLiked ?? false;
  }

  async getLikeCount(petPostId: string): Promise<number> {
    const res = await fetch(`${this.baseUrl}/${petPostId}/like`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "ไม่สามารถตรวจสอบจำนวนถูกใจได้");
    }
    const data = await res.json();
    return data.likeCount ?? 0;
  }

  async toggleLike(petPostId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${petPostId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || "ไม่สามารถเปลี่ยนสถานะถูกใจได้");
    }

    const data = await res.json();
    return data.isLiked ?? false;
  }
}
