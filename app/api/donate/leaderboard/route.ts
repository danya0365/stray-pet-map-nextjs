import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/leaderboard
 * Get donation leaderboard (weekly or all-time)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "weekly" | "alltime" | null;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!type || !["weekly", "alltime"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'weekly' or 'alltime'" },
        { status: 400 },
      );
    }

    const presenter = await createServerDonationPresenter();
    const result =
      type === "weekly"
        ? await presenter.getLeaderboardWeekly(limit)
        : await presenter.getLeaderboardAllTime(limit);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch leaderboard" },
        { status: 500 },
      );
    }

    return NextResponse.json({ entries: result.data || [] });
  } catch (error) {
    console.error("Error fetching donation leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
