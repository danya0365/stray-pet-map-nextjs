import { SupabaseBadgeRepository } from "@/infrastructure/repositories/supabase/SupabaseBadgeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

// GET /api/badges - ดึง leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const supabase = await createServerSupabaseClient();
    const repo = new SupabaseBadgeRepository(supabase);

    const leaderboard = await repo.getLeaderboard(limit);

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching badges leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
