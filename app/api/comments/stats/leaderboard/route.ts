/**
 * Comment Leaderboard API Route
 * GET: Get comment leaderboard (week/month/all)
 */

import type { CommentLeaderboardPeriod } from "@/domain/entities/comment-stats";
import { createServerCommentPresenter } from "@/presentation/presenters/comment/CommentPresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/comments/stats/leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const period =
      (searchParams.get("period") as CommentLeaderboardPeriod) || "week";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate period
    if (!["week", "month", "all"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use: week, month, or all" },
        { status: 400 },
      );
    }

    const presenter = await createServerCommentPresenter();
    const result = await presenter.getLeaderboard(period, limit);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const leaderboard = result.data || [];
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
