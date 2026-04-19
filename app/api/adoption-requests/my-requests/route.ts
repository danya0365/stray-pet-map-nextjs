/**
 * /api/adoption-requests/my-requests
 * API Route for getting current user's adoption requests
 *
 * ✅ Uses AdoptionRequestPresenter (Clean Architecture)
 * ✅ Returns list of adoption requests made by the current user
 */

import { createServerAdoptionRequestPresenter } from "@/presentation/presenters/adoption-request/AdoptionRequestPresenterServerFactory";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const presenter = await createServerAdoptionRequestPresenter();
    const result = await presenter.getMyRequests();

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
