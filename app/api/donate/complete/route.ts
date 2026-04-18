import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";

/**
 * POST /api/donate/complete
 * Complete donation with payment intent
 */
export async function POST(request: Request) {
  try {
    const { donationId, paymentIntentId, points } = await request.json();

    if (!donationId || !paymentIntentId) {
      return NextResponse.json(
        { error: "donationId and paymentIntentId are required" },
        { status: 400 },
      );
    }

    const presenter = createServerDonationPresenter();
    const donation = await presenter.completeDonation(
      donationId,
      paymentIntentId,
      points || 0,
    );

    return NextResponse.json({ donation });
  } catch (error) {
    console.error("Error completing donation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
