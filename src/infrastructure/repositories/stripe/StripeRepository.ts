/**
 * StripeRepository
 * Stripe implementation for donation checkout
 * Supports PromptPay and Credit Card
 * Dual mode: pet-specific + general fund + guest donations
 */

import type {
  CheckoutSessionParams,
  CheckoutSessionResult,
  IStripeRepository,
} from "@/application/repositories/IStripeRepository";
import Stripe from "stripe";

export class StripeRepository implements IStripeRepository {
  private stripe: Stripe;

  /**
   * Create StripeRepository instance
   * @param secretKey - Optional. Uses STRIPE_SECRET_KEY env var if not provided.
   *                    Pass a key explicitly for testing/mocking.
   */
  constructor(secretKey?: string) {
    // Use provided key, or fall back to env var
    const key = secretKey ?? process.env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error(
        "Stripe secret key is missing. Set STRIPE_SECRET_KEY environment variable or pass key to constructor.",
      );
    }

    this.stripe = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }

  async createCheckoutSession(
    params: CheckoutSessionParams,
  ): Promise<CheckoutSessionResult> {
    // Determine product name based on target type
    const productName =
      params.targetType === "pet" && params.petPostId
        ? "บริจาคให้น้องตัวนี้"
        : "บริจาคสนับสนุน StrayPetMap";

    const productDescription =
      params.targetType === "pet" && params.petPostId
        ? params.message || "ช่วยเหลือค่าอาหารและค่ารักษาพยาบาล"
        : params.message || "ช่วยเหลือค่าเซิร์ฟเวอร์และพัฒนาระบบ";

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card", "promptpay"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(params.amount * 100), // Convert to satang
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.donorEmail,
      metadata: {
        type: "donation",
        target_type: params.targetType,
        pet_post_id: params.petPostId || "",
        donor_name: params.donorName || "ผู้ใจดี",
        message: params.message || "",
        is_anonymous: String(params.isAnonymous || false),
        show_on_leaderboard: String(params.showOnLeaderboard ?? true),
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Construct Stripe event from webhook payload
   * Used for webhook signature verification
   */
  async constructEvent(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
