/**
 * /api/adoption-requests/[id]/status
 * API Route for updating adoption request status (approve/reject)
 *
 * ✅ Uses AdoptionRequestPresenter (Clean Architecture)
 * ✅ Owner-only: verifies the requesting user owns the pet post
 */

import { createServerAdoptionRequestPresenter } from "@/presentation/presenters/adoption-request/AdoptionRequestPresenterServerFactory";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    error: "กรุณาระบุสถานะให้ถูกต้อง",
  }),
});

// PATCH /api/adoption-requests/[id]/status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check auth
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // Validate body
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { status } = validation.data;

    // Update via presenter (repository handles owner verification)
    const presenter = await createServerAdoptionRequestPresenter();
    const result = await presenter.updateStatus(id, status);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
