/**
 * ApiFavoriteRepository
 * Implements IFavoriteRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  FavoriteQueryResult,
  IFavoriteRepository,
} from "@/application/repositories/IFavoriteRepository";
import type { PaginationMode } from "@/domain/types/pagination";

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

  async getFavoritePostIds(
    pagination?: PaginationMode,
  ): Promise<FavoriteQueryResult> {
    const params = new URLSearchParams();

    if (pagination) {
      if (pagination.type === "offset") {
        params.set("paginationType", "offset");
        params.set("page", String(pagination.page));
        params.set("perPage", String(pagination.perPage));
      } else {
        params.set("paginationType", "cursor");
        if (pagination.cursor) {
          params.set("cursor", pagination.cursor);
        }
        params.set("limit", String(pagination.limit ?? 20));
      }
    }

    const res = await fetch(`${this.baseUrl}?${params.toString()}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดรายการโปรดได้");
    }

    return res.json();
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
