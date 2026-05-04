/**
 * Comments API Routes for Pet Posts
 * GET: List top-level comments with pagination
 * POST: Create a new comment or reply
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().uuid().optional(),
});

// GET /api/pet-posts/[id]/comments - List comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: petPostId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse options
    const paginationType = searchParams.get("paginationType") || "cursor";
    const sortBy =
      (searchParams.get("sortBy") as "newest" | "oldest" | "popular") ||
      "newest";

    // Build pagination based on type
    let pagination;
    if (paginationType === "offset") {
      // Offset pagination (for admin)
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const perPage = parseInt(searchParams.get("perPage") ?? "20", 10);
      pagination = { type: "offset" as const, page, perPage };
    } else {
      // Cursor pagination (for frontend load more)
      const cursor = searchParams.get("cursor") || undefined;
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);
      pagination = { type: "cursor" as const, cursor, limit };
    }

    const presenter = await createServerCommentPresenter();
    const result = await presenter.getThread(petPostId, {
      pagination,
      sortBy,
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

// POST /api/pet-posts/[id]/comments - Create comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: petPostId } = await params;

    // Get profile from session
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated || !authViewModel.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { content, parentCommentId } = validation.data;

    // Create comment
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
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
