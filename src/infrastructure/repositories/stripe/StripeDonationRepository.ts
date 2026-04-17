/**
 * StripeDonationRepository
 * Stripe implementation for donation checkout
 * Supports PromptPay and Credit Card
 */

import type {
  DonationCheckoutParams,
  DonationCheckoutResult,
  IDonationRepository,
} from "@/application/repositories/IDonationRepository";
import Stripe from "stripe";

export class StripeDonationRepository implements IDonationRepository {
  private stripe: Stripe;

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("Stripe secret key is missing");
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    });
  }

  async createCheckoutSession(
    params: DonationCheckoutParams,
  ): Promise<DonationCheckoutResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card", "promptpay"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: "สนับสนุน StrayPetMap",
              description:
                params.message || "ช่วยเหลือนักพัฒนาและค่าใช้จ่ายเซิร์ฟเวอร์",
            },
            unit_amount: Math.round(params.amount * 100), // Convert to satang
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        type: "donation",
        message: params.message || "",
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
}
