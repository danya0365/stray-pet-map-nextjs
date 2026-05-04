/**
 * /api/adoption-requests/my-requests
 * API Route for getting current user's adoption requests
 * Supports both cursor and offset pagination
 *
 * ✅ Uses AdoptionRequestPresenter (Clean Architecture)
 * ✅ Returns list of adoption requests made by the current user
 */

import { createServerAdoptionRequestPresenter } from "@/presentation/presenters/adoption-request/AdoptionRequestPresenterServerFactory";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paginationType = searchParams.get("paginationType") || "cursor";

    // Build pagination based on type
    let pagination;
    if (paginationType === "offset") {
      // Offset pagination (for admin)
      const page = parseInt(searchParams.get("page") || "1", 10);
      const perPage = parseInt(searchParams.get("perPage") || "20", 10);
      pagination = { type: "offset" as const, page, perPage };
    } else {
      // Cursor pagination (for frontend load more)
      const cursor = searchParams.get("cursor") || undefined;
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      pagination = { type: "cursor" as const, cursor, limit };
    }

    const presenter = await createServerAdoptionRequestPresenter();
    const result = await presenter.getMyRequests(pagination);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
