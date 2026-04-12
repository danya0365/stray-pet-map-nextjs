import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { NextResponse } from "next/server";

// GET /api/pet-posts/success-stories - ดึงเรื่องราวความสำเร็จ
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    const supabase = await createServerSupabaseClient();
    const repo = new SupabasePetPostRepository(supabase);

    const stories = await repo.getSuccessStories(limit);

    return NextResponse.json({
      success: true,
      stories,
      total: stories.length,
    });
  } catch (error) {
    console.error("Error fetching success stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch success stories" },
      { status: 500 }
    );
  }
}
