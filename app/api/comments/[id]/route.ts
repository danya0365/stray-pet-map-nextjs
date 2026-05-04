/**
 * Single Comment API Routes
 * GET: Get a single comment with its thread
 * PATCH: Update comment content
 * DELETE: Soft delete comment
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

// GET /api/comments/[id] - Get single comment with thread
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: commentId } = await params;
    const { searchParams } = new URL(request.url);
    const depth = parseInt(searchParams.get("depth") || "3", 10);

    const presenter = await createServerCommentPresenter();
    const result = await presenter.getComment(commentId, depth);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch comment" },
      { status: 500 },
    );
  }
}

// PATCH /api/comments/[id] - Update comment
export async function PATCH(
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

    // Parse body
    const body = await request.json();
    const validation = updateCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { content } = validation.data;

    // Update comment
    const presenter = await createServerCommentPresenter();
    const result = await presenter.updateComment(
      commentId,
      { content },
      authViewModel.profile.id,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("not found") ? 404 : 400 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 },
    );
  }
}

// DELETE /api/comments/[id] - Soft delete comment
export async function DELETE(
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

    // Soft delete
    const presenter = await createServerCommentPresenter();
    const result = await presenter.deleteComment(
      commentId,
      authViewModel.profile.id,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
