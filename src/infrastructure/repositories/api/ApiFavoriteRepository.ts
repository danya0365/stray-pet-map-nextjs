/**
 * ApiFavoriteRepository
 * Implements IFavoriteRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type { IFavoriteRepository } from "@/application/repositories/IFavoriteRepository";

export class ApiFavoriteRepository implements IFavoriteRepository {
  private baseUrl = "/api/favorites";

  async isFavorited(petPostId: string): Promise<boolean> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petPostId, action: "check" }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถตรวจสอบรายการโปรดได้");
    }

    const data = await res.json();
    return data.isFavorited ?? false;
  }

  async getFavoritePostIds(): Promise<string[]> {
    const res = await fetch(this.baseUrl);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดรายการโปรดได้");
    }

    const data = await res.json();
    return data.postIds ?? [];
  }

  async addFavorite(petPostId: string): Promise<void> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petPostId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถเพิ่มรายการโปรดได้");
    }
  }

  async removeFavorite(petPostId: string): Promise<void> {
    // Toggle will handle remove if already favorited
    await this.toggleFavorite(petPostId);
  }

  async toggleFavorite(petPostId: string): Promise<boolean> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petPostId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถเปลี่ยนสถานะรายการโปรดได้");
    }

    const data = await res.json();
    return data.isFavorited ?? false;
  }
}
