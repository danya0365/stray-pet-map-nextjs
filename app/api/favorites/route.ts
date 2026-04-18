/**
 * /api/favorites
 * API Route for favorites operations
 *
 * ✅ GET = list favorite post IDs
 * ✅ POST = toggle favorite (returns { isFavorited: boolean })
 */

import { SupabaseFavoriteRepository } from "@/infrastructure/repositories/supabase/SupabaseFavoriteRepository";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/favorites — get favorite post IDs or full posts
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const expand = searchParams.get("expand") === "posts";

    const favRepo = new SupabaseFavoriteRepository(supabase);
    const postIds = await favRepo.getFavoritePostIds();

    if (!expand) {
      return NextResponse.json({ postIds });
    }

    // Expand to full posts
    if (postIds.length === 0) {
      return NextResponse.json({ postIds: [], posts: [] });
    }

    const postRepo = new SupabasePetPostRepository(supabase);
    const results = await Promise.all(
      postIds.map((id) => postRepo.getById(id)),
    );
    const posts = results.filter((p) => p !== null);

    return NextResponse.json({ postIds, posts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/favorites — toggle or check favorite
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const { petPostId, action } = await request.json();

    if (!petPostId) {
      return NextResponse.json(
        { error: "กรุณาระบุ petPostId" },
        { status: 400 },
      );
    }

    const favRepo = new SupabaseFavoriteRepository(supabase);

    // action = "check" → just check status
    if (action === "check") {
      const isFavorited = await favRepo.isFavorited(petPostId);
      return NextResponse.json({ isFavorited });
    }

    // Default: toggle
    const isFavorited = await favRepo.toggleFavorite(petPostId);
    return NextResponse.json({ isFavorited });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
