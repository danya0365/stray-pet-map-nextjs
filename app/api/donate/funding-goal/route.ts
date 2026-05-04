import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/funding-goal?petPostId=xxx
 * Get funding goal for a pet post
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const petPostId = searchParams.get("petPostId");

    if (!petPostId) {
      return NextResponse.json(
        { error: "petPostId is required" },
        { status: 400 },
      );
    }

    const presenter = await createServerDonationPresenter();
    const goal = await presenter.getPetFundingGoal(petPostId);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error fetching funding goal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
