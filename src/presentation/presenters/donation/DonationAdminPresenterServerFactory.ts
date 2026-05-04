/**
 * DonationAdminPresenterServerFactory
 * Factory for creating DonationPresenter instances for admin/webhook operations
 * Uses Supabase admin client with service role key (bypasses RLS)
 * Following Clean Architecture pattern
 */

import { StripeRepository } from "@/infrastructure/repositories/stripe/StripeRepository";
import { SupabaseDonationRepository } from "@/infrastructure/repositories/supabase/SupabaseDonationRepository";
import { createAdminSupabaseClient } from "@/infrastructure/supabase/admin";
import { DonationPresenter } from "./DonationPresenter";

/**
 * Factory for creating admin-level DonationPresenter (API Routes / Webhooks)
 * Uses Supabase admin client with service role key
 */
export function createAdminDonationPresenter(): DonationPresenter {
  const adminClient = createAdminSupabaseClient();
  const donationRepo = new SupabaseDonationRepository(adminClient);
  const stripeRepo = new StripeRepository();

  return new DonationPresenter(donationRepo, stripeRepo);
}
