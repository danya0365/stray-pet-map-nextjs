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
// GET - Get adoption requests by post ID
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

    const presenter = await createServerAdoptionRequestPresenter();
    const result = await presenter.getByPostId(petPostId);

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
