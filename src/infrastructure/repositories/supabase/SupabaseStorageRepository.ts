/**
 * SupabaseStorageRepository
 * Implementation of IStorageRepository using Supabase Storage
 * Following Clean Architecture - Infrastructure layer
 *
 * ✅ For SERVER-SIDE use only (API Routes, Server Components)
 * ❌ Do NOT use in Client Components directly
 */

import type {
  IStorageRepository,
  UploadResult,
} from "@/application/repositories/IStorageRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// CONSTANTS
// ============================================================

const THUMBNAIL_BUCKET = "thumbnails";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ============================================================
// SUPABASE STORAGE REPOSITORY
// ============================================================

export class SupabaseStorageRepository implements IStorageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async uploadThumbnail(file: File): Promise<UploadResult> {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("รองรับเฉพาะไฟล์ภาพ (JPEG, PNG, WebP, GIF)");
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
    }

    // Get auth user id for folder path
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลด");

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    const { error } = await this.supabase.storage
      .from(THUMBNAIL_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(`อัปโหลดไม่สำเร็จ: ${error.message}`);

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  }
}
