import { StripeRepository } from "@/infrastructure/repositories/stripe/StripeRepository";
import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/webhook/stripe - รับ webhook จาก Stripe
 * Saves donation + awards gamification points
 * ✅ Following Clean Architecture: Uses Presenter, not repositories directly
 *
 * ⚠️ IMPORTANT: This endpoint is configured in Stripe Dashboard as:
 *    https://straypetmap.online/api/webhook/stripe
 *
 * If the domain changes, you MUST update the webhook URL in:
 * - Stripe Dashboard → Developers → Webhooks → Endpoint URL
 * Otherwise, payment webhooks will fail silently.
 */
export async function POST(request: Request) {
  try {
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      // Use StripeRepository pattern (like live-learning-nextjs)
      const stripeRepo = new StripeRepository(
        process.env.STRIPE_SECRET_KEY || "",
      );
      event = await stripeRepo.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown signature error";
      console.error("Webhook signature verification failed:", errorMessage);
      return NextResponse.json(
        { error: `Invalid signature: ${errorMessage}` },
        { status: 400 },
      );
    }

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if this is a donation
      if (session.metadata?.type === "donation") {
        // ✅ Use Presenter for business logic (Clean Architecture)
        const presenter = createServerDonationPresenter();
        const result = await presenter.processCheckoutCompleted(session);

        if (!result.success) {
          console.error("Failed to process donation:", result.error);
          // Still return 200 to Stripe to prevent retries
          // Error is logged for investigation
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
