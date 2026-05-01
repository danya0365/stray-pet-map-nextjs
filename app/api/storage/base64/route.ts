/**
 * POST /api/storage/base64
 * API Route for base64 file uploads
 *
 * ✅ Uses StoragePresenter (Clean Architecture)
 * ✅ Receives JSON { base64Data, fileName, bucket, folder? }
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

    // Parse JSON body
    const body = await request.json();
    const { base64Data, fileName, bucket, folder } = body;

    if (!base64Data || !fileName || !bucket) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อมูลให้ครบถ้วน (base64Data, fileName, bucket)" },
        { status: 400 },
      );
    }

    // Upload via presenter (Clean Architecture)
    const presenter = await createServerStoragePresenter();
    const result = await presenter.uploadBase64(base64Data, fileName, bucket, folder);

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
