/**
 * ApiPetPostRepository
 * Implements IPetPostRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  IPetPostRepository,
  PetPostFilters,
  PetPostQuery,
  PetPostQueryResult,
} from "@/application/repositories/IPetPostRepository";
import type {
  CreatePetPostPayload,
  PetPost,
  PetPostStats,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";

export class ApiPetPostRepository implements IPetPostRepository {
  private baseUrl = "/api/pet-posts";

  async query(params: PetPostQuery): Promise<PetPostQueryResult> {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.set("search", params.search);
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    if (params.filters) {
      const f = params.filters;
      if (f.status) {
        const statuses = Array.isArray(f.status) ? f.status : [f.status];
        searchParams.set("status", statuses.join(","));
      }
      if (f.petTypeId) searchParams.set("petTypeId", f.petTypeId);
      if (f.gender) searchParams.set("gender", f.gender);
      if (f.province) searchParams.set("province", f.province);
    }

    if (params.pagination.type === "offset") {
      searchParams.set("page", String(params.pagination.page));
      searchParams.set("perPage", String(params.pagination.perPage));
    } else if (params.pagination.type === "cursor") {
      searchParams.set("paginationType", "cursor");
      searchParams.set("limit", String(params.pagination.limit));
      if (params.pagination.cursor) {
        searchParams.set("cursor", params.pagination.cursor);
      }
    }

    if (params.nearBy) {
      searchParams.set("nearLat", String(params.nearBy.latitude));
      searchParams.set("nearLng", String(params.nearBy.longitude));
      searchParams.set("nearRadius", String(params.nearBy.radiusKm));
    }

    const qs = searchParams.toString();
    const res = await fetch(`${this.baseUrl}${qs ? `?${qs}` : ""}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดข้อมูลได้");
    }

    return res.json();
  }

  async getById(id: string): Promise<PetPost | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดข้อมูลได้");
    }
    return res.json();
  }

  async create(data: CreatePetPostPayload): Promise<PetPost> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถสร้างโพสต์ได้");
    }

    return res.json();
  }

  async update(id: string, data: UpdatePetPostData): Promise<PetPost> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปเดตโพสต์ได้");
    }

    return res.json();
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถลบโพสต์ได้");
    }

    return true;
  }

  async getStats(filters?: PetPostFilters): Promise<PetPostStats> {
    const searchParams = new URLSearchParams();
    if (filters?.status) {
      const statuses = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      searchParams.set("status", statuses.join(","));
    }

    const qs = searchParams.toString();
    const res = await fetch(`${this.baseUrl}/stats${qs ? `?${qs}` : ""}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดสถิติได้");
    }

    return res.json();
  }

  async getSuccessStories(limit?: number): Promise<PetPost[]> {
    const qs = limit ? `?limit=${limit}` : "";
    const res = await fetch(`${this.baseUrl}/success-stories${qs}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดเรื่องราวความสำเร็จได้");
    }
    const data = await res.json();
    return data.stories || [];
  }

  // ไม่รองรับใน client-side API (server-only)
  async findExpiredPosts(): Promise<{ id: string; createdAt: string }[]> {
    throw new Error("findExpiredPosts is not supported in client-side API");
  }

  // ไม่รองรับใน client-side API (server-only)
  async findExpiringSoonPosts(): Promise<
    { id: string; title: string; createdAt: string; purpose: string }[]
  > {
    throw new Error(
      "findExpiringSoonPosts is not supported in client-side API",
    );
  }
}
