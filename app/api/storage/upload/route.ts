/**
 * POST /api/storage/upload
 * API Route for uploading thumbnail images
 *
 * ✅ Server-side only — uses SupabaseStorageRepository
 * ✅ Receives FormData with "file" field
 * ✅ Returns { url, path }
 */

import { SupabaseStorageRepository } from "@/infrastructure/repositories/supabase/SupabaseStorageRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนอัปโหลด" },
        { status: 401 },
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์ภาพ" },
        { status: 400 },
      );
    }

    // Upload via repository
    const storageRepo = new SupabaseStorageRepository(supabase);
    const result = await storageRepo.uploadThumbnail(file);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
