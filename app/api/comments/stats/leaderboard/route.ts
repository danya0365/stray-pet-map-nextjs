/**
 * Comment Leaderboard API Route
 * GET: Get comment leaderboard (week/month/all)
 */

import { SupabaseCommentRepository } from "@/infrastructure/repositories/supabase/SupabaseCommentRepository";
import type { CommentLeaderboardPeriod } from "@/domain/entities/comment-stats";
import { NextResponse } from "next/server";

// Initialize repository
const getRepository = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return new SupabaseCommentRepository(supabaseUrl, supabaseKey);
};

// GET /api/comments/stats/leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const period = (searchParams.get("period") as CommentLeaderboardPeriod) || "week";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate period
    if (!["week", "month", "all"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use: week, month, or all" },
        { status: 400 },
      );
    }

    const repo = getRepository();
    const leaderboard = await repo.getLeaderboard(period, limit);

    return NextResponse.json({
      period,
      leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
