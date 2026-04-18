import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/recent?limit=10
 * Get recent completed donations for ticker
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const presenter = createServerDonationPresenter();
    const donations = await presenter.getRecentDonations(limit);

    return NextResponse.json({ donations });
  } catch (error) {
    console.error("Error fetching recent donations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
