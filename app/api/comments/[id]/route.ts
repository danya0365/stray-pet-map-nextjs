/**
 * Single Comment API Routes
 * GET: Get a single comment with its thread
 * PATCH: Update comment content
 * DELETE: Soft delete comment
 */

import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
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

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  return profile?.id || null;
};

// GET /api/comments/[id] - Get single comment with thread
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: commentId } = await params;
    const { searchParams } = new URL(request.url);
    const depth = parseInt(searchParams.get("depth") || "3", 10);

    const repo = getRepository();
    const comment = await repo.getThreadTree(commentId, depth);

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(comment);
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
    const validation = updateCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { content } = validation.data;

    // Update comment
    const repo = getRepository();
    const updated = await repo.update(commentId, { content }, profileId);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating comment:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 },
      );
    }
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

    // Authenticate
    const profileId = await getUserFromToken(request);
    if (!profileId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Soft delete
    const repo = getRepository();
    await repo.softDelete(commentId, profileId, "self");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
