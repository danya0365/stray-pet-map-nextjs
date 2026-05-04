/**
 * StripePresenter
 * Handles Stripe webhook verification and event parsing
 * Following Clean Architecture - does NOT call other presenters
 * Returns parsed event for API route to handle routing
 */

import type { IStripeRepository } from "@/application/repositories/IStripeRepository";
import type Stripe from "stripe";

export interface WebhookVerificationSuccess {
  success: true;
  event: Stripe.Event;
  type: string;
  metadata?: Record<string, string>;
  sessionId?: string;
}

export interface WebhookVerificationError {
  success: false;
  error: string;
}

export type WebhookVerificationResult =
  | WebhookVerificationSuccess
  | WebhookVerificationError;

/**
 * Presenter for Stripe webhook handling
 * ✅ Only verifies and parses webhook - NO business logic
 * ✅ API route decides what to do with the event
 * ✅ Receives repository via constructor injection
 */
export class StripePresenter {
  constructor(private readonly stripeRepo: IStripeRepository) {}

  /**
   * Verify and parse Stripe webhook event
   * Returns parsed event for API route to handle
   * Does NOT process the event - that's the API route's job
   */
  async verifyAndParseWebhook(
    payload: string,
    signature: string,
    secret: string,
  ): Promise<WebhookVerificationResult> {
    try {
      const event = await this.stripeRepo.constructEvent(
        payload,
        signature,
        secret,
      );

      // Extract common metadata based on event type
      let metadata: Record<string, string> | undefined;
      let sessionId: string | undefined;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        metadata = session.metadata || undefined;
        sessionId = session.id;
      }

      return {
        success: true,
        event,
        type: event.type,
        metadata,
        sessionId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown signature error";
      console.error("Webhook signature verification failed:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if event is a donation checkout completion
   * Helper for API route to decide routing
   */
  isDonationCheckoutCompleted(
    result: WebhookVerificationSuccess,
  ): boolean {
    return (
      result.type === "checkout.session.completed" &&
      result.metadata?.type === "donation"
    );
  }
}
