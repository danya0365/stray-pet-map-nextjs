import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * GET /api/donate/session?sessionId=xxx
 * Find donation by Stripe session ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    const presenter = createServerDonationPresenter();
    const donation = await presenter.findByStripeSessionId(sessionId);

    return NextResponse.json({ donation });
  } catch (error) {
    console.error("Error finding donation by session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
