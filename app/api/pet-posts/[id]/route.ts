/**
 * /api/pet-posts/[id]
 * API Route for single pet post operations
 *
 * ✅ Uses PetPostPresenter (Clean Architecture)
 * ✅ GET = getById (public)
 * ✅ PUT = update (auth required)
 * ✅ DELETE = soft delete (auth required)
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerPetPostPresenter } from "@/presentation/presenters/pet-post/PetPostPresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/pet-posts/[id] — get single pet post (public)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const presenter = await createServerPetPostPresenter();

    const result = await presenter.getById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "ไม่พบโพสต์ที่ต้องการ" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/pet-posts/[id] — update pet post (auth required)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await request.json();
    const presenter = await createServerPetPostPresenter();
    const result = await presenter.update(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถอัปเดตโพสต์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/pet-posts/[id] — soft delete pet post (auth required)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const presenter = await createServerPetPostPresenter();
    const result = await presenter.delete(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถลบโพสต์ได้";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
