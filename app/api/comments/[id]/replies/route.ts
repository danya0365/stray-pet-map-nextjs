/**
 * Comment Replies API Routes
 * GET: Get paginated replies for a comment
 * POST: Create a reply to this comment
 */

import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema
const createReplySchema = z.object({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  return profile?.id || null;
};

// GET /api/comments/[id]/replies - Get replies
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: parentCommentId } = await params;
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const repo = getRepository();
    const replies = await repo.findReplies(parentCommentId, { cursor, limit });

    return NextResponse.json({
      replies,
      count: replies.length,
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

    // Authenticate
    const profileId = await getUserFromToken(request);
    if (!profileId) {
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
    const repo = getRepository();
    const parent = await repo.findById(parentCommentId);

    if (!parent) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 },
      );
    }

    // Check depth limit
    const depth = await repo.getCommentDepth(parentCommentId);
    if (depth >= 10) {
      return NextResponse.json(
        { error: "Maximum nesting depth reached" },
        { status: 400 },
      );
    }

    // Create reply
    const comment = await repo.create(
      {
        petPostId: parent.petPostId,
        content,
        parentCommentId,
      },
      profileId,
    );

    // Get gamification info
    const gamificationInfo = await repo.getGamificationInfo(
      profileId,
      "reply_created",
    );

    return NextResponse.json(
      {
        comment,
        gamification: gamificationInfo,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json(
      { error: "Failed to create reply" },
      { status: 500 },
    );
  }
}
