/**
 * Comment Reaction API Routes
 * POST: Add or update reaction (like, helpful, insightful, heart)
 * DELETE: Remove reaction
 */

import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import { COMMENT_REACTION_TYPES } from "@/domain/entities/comment";
import type { CommentReactionType } from "@/domain/entities/comment";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const reactionSchema = z.object({
  type: z.enum(["like", "helpful", "insightful", "heart"] as const),
});

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

// POST /api/comments/[id]/reaction - Add/update reaction
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

    const repo = getRepository();
    await repo.addReaction(commentId, profileId, type as CommentReactionType);

    return NextResponse.json({
      reaction: type,
      success: true,
    });
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

    // Authenticate
    const profileId = await getUserFromToken(request);
    if (!profileId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const repo = getRepository();
    await repo.removeReaction(commentId, profileId);

    return NextResponse.json({ reaction: null, success: true });
  } catch (error) {
    console.error("Error removing reaction:", error);
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 },
    );
  }
}
