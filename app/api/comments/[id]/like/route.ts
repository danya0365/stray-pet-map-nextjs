/**
 * Comment Like API Routes
 * POST: Like a comment
 * DELETE: Unlike a comment
 */

import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import { NextResponse } from "next/server";

// Initialize repository
const getRepository = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return new SupabaseCommentRepository(supabaseUrl, supabaseKey);
};

// Helper to get user from token
const getUserFromToken = async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  return profile?.id || null;
};

// POST /api/comments/[id]/like - Like comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: commentId } = await params;

    // Authenticate
    const profileId = await getUserFromToken(request);
    if (!profileId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const repo = getRepository();

    // Check if already liked
    const alreadyLiked = await repo.hasLiked(commentId, profileId);
    if (alreadyLiked) {
      return NextResponse.json({
        liked: true,
        message: "Already liked",
      });
    }

    // Add like
    await repo.addLike(commentId, profileId);

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 },
    );
  }
}

// DELETE /api/comments/[id]/like - Unlike comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: commentId } = await params;

    // Authenticate
    const profileId = await getUserFromToken(request);
    if (!profileId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const repo = getRepository();
    await repo.removeLike(commentId, profileId);

    return NextResponse.json({ liked: false });
  } catch (error) {
    console.error("Error unliking comment:", error);
    return NextResponse.json(
      { error: "Failed to unlike comment" },
      { status: 500 },
    );
  }
}
