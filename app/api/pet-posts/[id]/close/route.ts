import type { PetPostOutcome } from "@/domain/entities/pet-post";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerPetPostPresenter } from "@/presentation/presenters/pet-post/PetPostPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

const closePostSchema = z.object({
  outcome: z.enum(["owner_found", "rehomed", "cancelled"], {
    error: "กรุณาเลือกผลลัพธ์",
  }),
});

// POST /api/pet-posts/[id]/close - ปิดโพสต์พร้อมระบุผลลัพธ์
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;

    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate body
    const body = await request.json();
    const validation = closePostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { outcome } = validation.data;

    // Get post to verify ownership
    const presenter = await createServerPetPostPresenter();
    const getResult = await presenter.getById(postId);

    if (!getResult.success || !getResult.data) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify owner
    if (getResult.data.profileId !== authViewModel.profile.id) {
      return NextResponse.json(
        { error: "Forbidden - not post owner" },
        { status: 403 },
      );
    }

    // Close post via presenter
    const closeResult = await presenter.close(
      postId,
      outcome as PetPostOutcome,
    );

    if (!closeResult.success) {
      return NextResponse.json({ error: closeResult.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, post: closeResult.data });
  } catch (error) {
    console.error("Close post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
