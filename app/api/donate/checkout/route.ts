import type { DonationTargetType } from "@/domain/entities/donation";
import { createAdminDonationPresenter } from "@/presentation/presenters/donation/DonationAdminPresenterServerFactory";
import { NextResponse } from "next/server";

// POST /api/donate/checkout - สร้าง Stripe checkout session สำหรับ donation
// Supports dual mode: pet-specific + general fund + guest donations
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount,
      message,
      successUrl,
      cancelUrl,
      targetType = "fund", // 'pet' | 'fund'
      petPostId,
      donorName,
      donorEmail,
      isAnonymous = false,
      showOnLeaderboard = true,
    } = body;

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

    // Validate targetType
    if (targetType === "pet" && !petPostId) {
      return NextResponse.json(
        { error: "petPostId is required when targetType is 'pet'" },
        { status: 400 },
      );
    }

    // Create checkout session via presenter
    const presenter = createAdminDonationPresenter();
    const result = await presenter.createCheckoutSession({
      amount,
      message,
      successUrl,
      cancelUrl,
      targetType: targetType as DonationTargetType,
      petPostId,
      donorName,
      donorEmail,
      isAnonymous,
      showOnLeaderboard,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: result.sessionUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error("Error creating donation checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
