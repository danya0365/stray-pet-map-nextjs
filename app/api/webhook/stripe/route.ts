import { createServerDonationPresenter } from "@/presentation/presenters/donation/DonationPresenterServerFactory";
import { createServerStripePresenter } from "@/presentation/presenters/stripe/StripePresenterServerFactory";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

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

    // ✅ StripePresenter ทำหน้าที่ verify webhook เท่านั้น
    const stripePresenter = createServerStripePresenter();

    const verifyResult = await stripePresenter.verifyAndParseWebhook(
      payload,
      signature,
      webhookSecret,
    );

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: `Invalid signature: ${verifyResult.error}` },
        { status: 400 },
      );
    }

    // ✅ API Route เป็นคนตัดสินใจว่า event นี้ควรไปไหน (No presenter calling presenter)
    if (stripePresenter.isDonationCheckoutCompleted(verifyResult)) {
      const session = verifyResult.event.data.object as Stripe.Checkout.Session;
      const donationPresenter = createServerDonationPresenter();

      const result = await donationPresenter.processCheckoutCompleted(session);

      if (!result.success) {
        console.error("Failed to process donation:", result.error);
        // Still return 200 to Stripe to prevent retries
        // Error is logged for investigation
      }
    }
    // ⏳ TODO: Add other event handlers here (e.g., subscription, refund)
    // else if (verifyResult.type === 'invoice.payment_succeeded') { ... }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
