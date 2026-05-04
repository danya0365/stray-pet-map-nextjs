/**
 * /api/adoption-requests
 * API Route for adoption request CRUD operations
 *
 * ✅ Uses AdoptionRequestPresenter (Clean Architecture)
 * ✅ Client components call this via ApiAdoptionRequestRepository
 */

import { createServerAdoptionRequestPresenter } from "@/presentation/presenters/adoption-request/AdoptionRequestPresenterServerFactory";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

// ============================================================
// POST - Create adoption request
// ============================================================

export async function POST(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await request.json();
    const presenter = await createServerAdoptionRequestPresenter();

    const result = await presenter.create({
      petPostId: body.petPostId,
      message: body.message,
      contactPhone: body.contactPhone,
      contactLineId: body.contactLineId,
    });

    if (!result.success) {
      // Handle duplicate request error
      if (result.isDuplicate) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถส่งคำขอรับเลี้ยงได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================
// GET - Get adoption requests by post ID (supports both cursor and offset pagination)
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petPostId = searchParams.get("petPostId");

    if (!petPostId) {
      return NextResponse.json(
        { error: "กรุณาระบุ petPostId" },
        { status: 400 },
      );
    }

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
    const result = await presenter.getByPostId(petPostId, pagination);

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
