import type { SupabaseClient } from "@supabase/supabase-js";

const THUMBNAIL_BUCKET = "thumbnails";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadThumbnail(
  supabase: SupabaseClient,
  file: File,
): Promise<UploadResult> {
  // Validate
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์ภาพ (JPEG, PNG, WebP, GIF)");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
  }

  // Get auth user id for folder path
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลด");

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `${user.id}/${fileName}`;

  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(`อัปโหลดไม่สำเร็จ: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
}
