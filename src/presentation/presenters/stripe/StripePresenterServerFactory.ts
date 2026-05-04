/**
 * StripePresenterServerFactory
 * Factory for creating StripePresenter instances on the server side
 * Following Clean Architecture pattern
 */

import { StripeRepository } from "@/infrastructure/repositories/stripe/StripeRepository";
import { StripePresenter } from "./StripePresenter";

/**
 * Factory for creating server-side StripePresenter
 */
export function createServerStripePresenter(): StripePresenter {
  const stripeRepo = new StripeRepository();
  return new StripePresenter(stripeRepo);
}
