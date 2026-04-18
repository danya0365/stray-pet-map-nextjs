import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/donor-stats?donorId=xxx
 * Get donor's total donations (for gamification)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get("donorId");

    if (!donorId) {
      return NextResponse.json(
        { error: "donorId is required" },
        { status: 400 },
      );
    }

    const presenter = createServerDonationPresenter();
    const total = await presenter.getDonorTotal(donorId);

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Error fetching donor stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
