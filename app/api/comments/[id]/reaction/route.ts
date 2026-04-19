/**
 * Comment Reaction API Routes
 * POST: Add or update reaction (like, helpful, insightful, heart)
 * DELETE: Remove reaction
 */

import type { CommentReactionType } from "@/domain/entities/comment";
import { COMMENT_REACTION_TYPES } from "@/domain/entities/comment";
import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const reactionSchema = z.object({
  type: z.enum(["like", "helpful", "insightful", "heart"] as const),
});

// POST /api/comments/[id]/reaction - Add/update reaction
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

    // Parse body
    const body = await request.json();
    const validation = reactionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid reaction type", validTypes: COMMENT_REACTION_TYPES },
        { status: 400 },
      );
    }

    const { type } = validation.data;

    const presenter = await createServerCommentPresenter();
    const result = await presenter.addReaction(
      commentId,
      authViewModel.profile.id,
      type as CommentReactionType,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: "Failed to add reaction" },
      { status: 500 },
    );
  }
}

// DELETE /api/comments/[id]/reaction - Remove reaction
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

    const presenter = await createServerCommentPresenter();
    const result = await presenter.removeReaction(
      commentId,
      authViewModel.profile.id,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing reaction:", error);
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 },
    );
  }
}
