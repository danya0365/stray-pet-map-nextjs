/**
 * ApiPetTypeRepository
 * Implements IPetTypeRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import type { PetType } from "@/domain/entities/pet-post";

export class ApiPetTypeRepository implements IPetTypeRepository {
  private baseUrl = "/api/pet-types";

  async getAll(): Promise<PetType[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดชนิดสัตว์ได้");
    }
    return res.json();
  }

  async getById(id: string): Promise<PetType | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดข้อมูลได้");
    }
    return res.json();
  }

  async getBySlug(slug: string): Promise<PetType | null> {
    const res = await fetch(`${this.baseUrl}?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดข้อมูลได้");
    }
    const data = await res.json();
    return Array.isArray(data) ? data[0] || null : data;
  }
}
