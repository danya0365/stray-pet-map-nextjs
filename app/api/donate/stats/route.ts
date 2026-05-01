import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/stats
 * Get donation statistics (total, monthly, weekly)
 */
export async function GET() {
  try {
    const presenter = await createServerDonationPresenter();
    const result = await presenter.getStats();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch donation stats" },
        { status: 500 },
      );
    }

    return NextResponse.json({ stats: result.data || null });
  } catch (error) {
    console.error("Error fetching donation stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
