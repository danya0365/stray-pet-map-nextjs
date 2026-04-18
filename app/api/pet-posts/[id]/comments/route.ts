/**
 * Comments API Routes for Pet Posts
 * GET: List top-level comments with pagination
 * POST: Create a new comment or reply
 */

import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().uuid().optional(),
});

// Initialize repository
const getRepository = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return new SupabaseCommentRepository(supabaseUrl, supabaseKey);
};

// GET /api/pet-posts/[id]/comments - List comments
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: petPostId } = await params;
    const { searchParams } = new URL(request.url);

    // Parse options
    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sortBy = (searchParams.get("sortBy") as "newest" | "oldest" | "popular") || "newest";

    const repo = getRepository();
    const thread = await repo.findByPetPostId(petPostId, {
      cursor,
      limit,
      sortBy,
    });

    return NextResponse.json(thread);
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

    // Get user from auth header (middleware should set this)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

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

    // Get profile ID from token (we'd use Supabase auth here)
    // For now, decode the token to get user info
    // In production, use Supabase admin client
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

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      );
    }

    // Get profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userData.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    // Create comment
    const repo = getRepository();
    const comment = await repo.create({
      petPostId,
      content,
      parentCommentId,
    }, profile.id);

    // Get gamification info
    const action = parentCommentId ? "reply_created" : "comment_created";
    const gamificationInfo = await repo.getGamificationInfo(profile.id, action);

    return NextResponse.json({
      comment,
      gamification: gamificationInfo,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
