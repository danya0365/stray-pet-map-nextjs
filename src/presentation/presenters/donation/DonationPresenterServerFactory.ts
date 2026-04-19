/**
 * DonationPresenterServerFactory
 * Factory for creating DonationPresenter instances on the server side
 * Following Clean Architecture pattern
 */

import { StripeRepository } from "@/infrastructure/repositories/stripe/StripeRepository";
import { SupabaseDonationRepository } from "@/infrastructure/repositories/supabase/SupabaseDonationRepository";
import { createAdminSupabaseClient } from "@/infrastructure/supabase/admin";
import { DonationPresenter } from "./DonationPresenter";

/**
 * Factory for creating server-side DonationPresenter
 * Uses Supabase repository with admin client for webhook processing
 */
export function createServerDonationPresenter(): DonationPresenter {
  const adminClient = createAdminSupabaseClient();
  const donationRepo = new SupabaseDonationRepository(adminClient);
  const stripeRepo = new StripeRepository();

  return new DonationPresenter(donationRepo, stripeRepo);
}
