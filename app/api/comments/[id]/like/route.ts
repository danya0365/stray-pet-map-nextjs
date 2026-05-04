/**
 * Comment Like API Routes
 * POST: Like a comment
 * DELETE: Unlike a comment
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";

// POST /api/comments/[id]/like - Toggle like comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: commentId } = await params;

    // Authenticate using server session
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presenter = await createServerCommentPresenter();
    const result = await presenter.toggleLike(
      commentId,
      authViewModel.profile.id,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 },
    );
  }
}
