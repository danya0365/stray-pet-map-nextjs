import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/comments?petPostId=xxx&paginationType=cursor|offset&...
 * Get comments for a pet post (supports both cursor and offset pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petPostId = searchParams.get("petPostId");

    if (!petPostId) {
      return NextResponse.json(
        { error: "petPostId is required" },
        { status: 400 },
      );
    }

    const paginationType = searchParams.get("paginationType") || "cursor";
    const sortBy =
      (searchParams.get("sortBy") as "newest" | "oldest" | "popular") ||
      "newest";

    // Build pagination based on type
    let pagination;
    if (paginationType === "offset") {
      // Offset pagination (for admin)
      const page = parseInt(searchParams.get("page") || "1", 10);
      const perPage = parseInt(searchParams.get("perPage") || "20", 10);
      pagination = { type: "offset" as const, page, perPage };
    } else {
      // Cursor pagination (for frontend load more)
      const cursor = searchParams.get("cursor") || undefined;
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      pagination = { type: "cursor" as const, cursor, limit };
    }

    // Authenticate to fetch user-specific interaction state
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    const presenter = await createServerCommentPresenter();
    const result = await presenter.getThread(petPostId, {
      pagination,
      sortBy,
      viewerProfileId: authViewModel.profile?.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { petPostId, content, parentCommentId } = body;

    if (!petPostId || !content) {
      return NextResponse.json(
        { error: "petPostId and content are required" },
        { status: 400 },
      );
    }

    // Get profile from session
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presenter = await createServerCommentPresenter();
    const result = await presenter.createComment(
      {
        petPostId,
        content,
        parentCommentId,
      },
      authViewModel.profile.id,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
