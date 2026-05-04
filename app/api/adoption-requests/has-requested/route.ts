/**
 * /api/adoption-requests/has-requested
 * API Route for checking if current user has requested a specific pet post
 *
 * ✅ Uses AdoptionRequestPresenter (Clean Architecture)
 * ✅ Query param: petPostId
 */

import { createServerAdoptionRequestPresenter } from "@/presentation/presenters/adoption-request/AdoptionRequestPresenterServerFactory";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

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

    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const presenter = await createServerAdoptionRequestPresenter();
    const result = await presenter.hasRequested(petPostId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ hasRequested: result.hasRequested });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถตรวจสอบสถานะได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
