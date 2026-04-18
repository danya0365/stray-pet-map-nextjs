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

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("Stripe secret key is missing");
    }
    this.stripe = new Stripe(secretKey, {
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
