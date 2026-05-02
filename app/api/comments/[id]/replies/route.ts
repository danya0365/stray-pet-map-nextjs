/**
 * Comment Replies API Routes
 * GET: Get paginated replies for a comment
 * POST: Create a reply to this comment
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const createReplySchema = z.object({
  content: z.string().min(1).max(2000),
});

// GET /api/comments/[id]/replies - Get replies (supports both cursor and offset pagination)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: parentCommentId } = await params;
    const { searchParams } = new URL(request.url);

    const paginationType = searchParams.get("paginationType") || "cursor";

    // Build pagination based on type
    let pagination;
    if (paginationType === "offset") {
      // Offset pagination (for admin)
      const page = parseInt(searchParams.get("page") || "1", 10);
      const perPage = parseInt(searchParams.get("perPage") || "10", 10);
      pagination = { type: "offset" as const, page, perPage };
    } else {
      // Cursor pagination (for frontend load more)
      const cursor = searchParams.get("cursor") || undefined;
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      pagination = { type: "cursor" as const, cursor, limit };
    }

    // Authenticate to fetch user-specific interaction state
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    const presenter = await createServerCommentPresenter();
    const result = await presenter.getReplies(parentCommentId, {
      pagination,
      viewerProfileId: authViewModel.profile?.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      replies: result.data?.replies || [],
      hasMore: result.data?.hasMore || false,
      nextCursor: result.data?.nextCursor,
      count: result.data?.replies?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 },
    );
  }
}

// POST /api/comments/[id]/replies - Create reply
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: parentCommentId } = await params;

    // Authenticate using server session
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const validation = createReplySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { content } = validation.data;

    // Get parent comment to find petPostId
    const presenter = await createServerCommentPresenter();
    const parentResult = await presenter.getComment(parentCommentId);

    if (!parentResult.success || !parentResult.data) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 },
      );
    }

    // Create reply (depth limit handled by presenter)
    const result = await presenter.createComment(
      {
        petPostId: parentResult.data.petPostId,
        content,
        parentCommentId,
      },
      authViewModel.profile.id,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes("depth") ? 400 : 500 },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 },
    );
  }
}
