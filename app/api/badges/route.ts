import { createServerBadgePresenter } from "@/presentation/presenters/badge/BadgePresenterServerFactory";
import { NextResponse } from "next/server";

// GET /api/badges - ดึง leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const presenter = await createServerBadgePresenter();
    const result = await presenter.getLeaderboard(limit);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leaderboard: result.leaderboard,
    });
  } catch (error) {
    console.error("Error fetching badges leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
