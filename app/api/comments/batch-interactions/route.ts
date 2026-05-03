/**
 * Comment Batch Interactions API Route
 * GET: Fetch user interaction state (likes + reactions) for multiple comments
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/comments/batch-interactions?ids=id1,id2,id3
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Missing ids parameter" },
        { status: 400 },
      );
    }

    const commentIds = idsParam.split(",").filter(Boolean);

    if (commentIds.length === 0) {
      return NextResponse.json({ interactions: {} });
    }

    // Authenticate using server session
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presenter = await createServerCommentPresenter();
    const interactions = await presenter.getUserInteractionsForComments(
      commentIds,
      authViewModel.profile.id,
    );

    // Convert Map to plain object for JSON serialization
    const interactionsRecord: Record<
      string,
      { hasLiked: boolean; reaction: string | null }
    > = {};
    interactions.forEach((value, key) => {
      interactionsRecord[key] = {
        hasLiked: value.hasLiked,
        reaction: value.reaction,
      };
    });

    return NextResponse.json({ interactions: interactionsRecord });
  } catch (error) {
    console.error("Error fetching batch interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 },
    );
  }
}
