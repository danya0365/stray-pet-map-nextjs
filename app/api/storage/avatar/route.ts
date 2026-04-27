/**
 * POST /api/storage/avatar
 * API Route for uploading avatar images
 *
 * ✅ Uses StoragePresenter (Clean Architecture)
 * ✅ Receives FormData with "file" field
 * ✅ Returns { url, path }
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerStoragePresenter } from "@/presentation/presenters/storage/StoragePresenterServerFactory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check auth via AuthPresenter (outside presenter, following Clean Architecture)
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์ภาพ" }, { status: 400 });
    }

    // Upload via presenter (Clean Architecture)
    const presenter = await createServerStoragePresenter();
    const result = await presenter.uploadAvatar(file);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
