/**
 * POST /api/storage/raw
 * API Route for generic file uploads (upload DTO)
 *
 * ✅ Uses StoragePresenter (Clean Architecture)
 * ✅ Receives multipart FormData with file metadata
 * ✅ Returns { url }
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerStoragePresenter } from "@/presentation/presenters/storage/StoragePresenterServerFactory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;
    const contentType = formData.get("contentType") as string | null;
    const bucket = formData.get("bucket") as string | null;
    const folder = formData.get("folder") as string | null;

    if (!file || !fileName || !contentType || !bucket) {
      return NextResponse.json(
        {
          error:
            "กรุณาระบุข้อมูลให้ครบถ้วน (file, fileName, contentType, bucket)",
        },
        { status: 400 },
      );
    }

    // Convert File to Buffer for server-side repository
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload via presenter (Clean Architecture)
    const presenter = await createServerStoragePresenter();
    const result = await presenter.uploadImage({
      buffer,
      fileName,
      contentType,
      bucket,
      folder: folder || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
