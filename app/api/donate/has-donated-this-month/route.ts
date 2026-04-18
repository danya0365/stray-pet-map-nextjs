import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/has-donated-this-month?donorId=xxx
 * Check if donor has donated this month (for badges)
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
    const hasDonated = await presenter.hasDonatedThisMonth(donorId);

    return NextResponse.json({ hasDonated });
  } catch (error) {
    console.error("Error checking donor status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
