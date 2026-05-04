/**
 * /api/favorites
 * API Route for favorites operations
 *
 * ✅ Uses FavoritePresenter (Clean Architecture)
 * ✅ GET = list favorite post IDs
 * ✅ POST = toggle favorite (returns { isFavorited: boolean })
 */

import { createServerAuthPresenter } from "@/presentation/presenters/auth/AuthPresenterServerFactory";
import { createServerFavoritePresenter } from "@/presentation/presenters/favorite/FavoritePresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/favorites — get favorite post IDs or full posts
// Supports both offset and cursor pagination
export async function GET(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const expand = searchParams.get("expand") === "posts";
    const paginationType = searchParams.get("paginationType") || "cursor";

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

    const presenter = await createServerFavoritePresenter();

    if (!expand) {
      const result = await presenter.getFavoritePostIds(pagination);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      // Return the FavoriteQueryResult directly
      return NextResponse.json(result.data);
    }

    // Expand to full posts
    const result = await presenter.getFavoritePosts(pagination);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      postIds: result.postIds,
      posts: result.posts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/favorites — toggle or check favorite
export async function POST(request: Request) {
  try {
    // Check auth via AuthPresenter
    const authPresenter = await createServerAuthPresenter();
    const authViewModel = await authPresenter.getViewModel();

    if (!authViewModel.isAuthenticated) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { petPostId, action } = await request.json();

    if (!petPostId) {
      return NextResponse.json(
        { error: "กรุณาระบุ petPostId" },
        { status: 400 },
      );
    }

    const presenter = await createServerFavoritePresenter();

    // action = "check" → just check status
    if (action === "check") {
      const result = await presenter.checkFavorite(petPostId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json({ isFavorited: result.isFavorited });
    }

    // Default: toggle
    const result = await presenter.toggleFavorite(petPostId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ isFavorited: result.isFavorited });
  } catch (error) {
    const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
