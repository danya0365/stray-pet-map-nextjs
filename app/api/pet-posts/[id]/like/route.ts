/**
 * Pet Post Like API Routes
 * GET: Check like status + count (public)
 * POST: Toggle like on a pet post (auth required)
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerPetPostLikePresenter } from "@/presentation/presenters/pet-post-like/PetPostLikePresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/pet-posts/[id]/like — get like status and count
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: petPostId } = await params;

    const presenter = await createServerPetPostLikePresenter();
    const result = await presenter.getLikeStatus(petPostId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get like status" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      isLiked: result.data?.isLiked ?? false,
      likeCount: result.data?.likeCount ?? 0,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 },
    );
  }
}

// POST /api/pet-posts/[id]/like — toggle like
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: petPostId } = await params;

    // Authenticate using server session
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const presenter = await createServerPetPostLikePresenter();
    const result = await presenter.toggleLike(petPostId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to toggle like" },
        { status: 400 },
      );
    }

    // Re-fetch count after toggle for accuracy
    const statusResult = await presenter.getLikeStatus(petPostId);

    return NextResponse.json({
      isLiked: result.data?.isLiked ?? false,
      likeCount: statusResult.data?.likeCount ?? 0,
    });
  } catch (error) {
    console.error("Error toggling pet post like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
