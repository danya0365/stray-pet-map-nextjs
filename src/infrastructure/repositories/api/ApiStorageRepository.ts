/**
 * ApiStorageRepository
 * Implements IStorageRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  IStorageRepository,
  UploadResult,
} from "@/application/repositories/IStorageRepository";

export class ApiStorageRepository implements IStorageRepository {
  private baseUrl = "/api/storage";

  async uploadThumbnail(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปโหลดรูปภาพได้");
    }

    return res.json();
  }

  async uploadAvatar(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/avatar`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปโหลดรูปภาพได้");
    }

    return res.json();
  }
}
