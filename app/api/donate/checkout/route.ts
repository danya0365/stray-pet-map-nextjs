import { StripeDonationRepository } from "@/infrastructure/repositories/stripe/StripeDonationRepository";
import { NextResponse } from "next/server";

// POST /api/donate/checkout - สร้าง Stripe checkout session สำหรับ donation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, message, successUrl, cancelUrl } = body;

    // Validation
    if (!amount || amount < 20) {
      return NextResponse.json(
        { error: "Amount must be at least 20 THB" },
        { status: 400 },
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing successUrl or cancelUrl" },
        { status: 400 },
      );
    }

    // Create checkout session
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 },
      );
    }

    const repo = new StripeDonationRepository(stripeSecretKey);
    const result = await repo.createCheckoutSession({
      amount,
      message,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating donation checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
