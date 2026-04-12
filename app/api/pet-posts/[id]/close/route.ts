import type { PetPostOutcome } from "@/domain/entities/pet-post";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

const closePostSchema = z.object({
  outcome: z.enum(["owner_found", "rehomed", "cancelled"], {
    error: "กรุณาเลือกผลลัพธ์",
  }),
});

// POST /api/pet-posts/[id]/close - ปิดโพสต์พร้อมระบุผลลัพธ์
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { id: postId } = await params;

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate body
    const body = await request.json();
    const result = closePostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 },
      );
    }

    const { outcome } = result.data;

    // Get post to verify ownership
    const repo = new SupabasePetPostRepository(supabase);
    const post = await repo.getById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify owner
    if (post.profileId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - not post owner" },
        { status: 403 },
      );
    }

    // Update post with outcome and archive
    const updated = await repo.update(postId, {
      outcome: outcome as PetPostOutcome,
      resolvedAt: new Date().toISOString(),
      isArchived: true,
      isActive: false,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("Close post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
