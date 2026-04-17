/**
 * DonationPresenterServerFactory
 * Factory for creating DonationPresenter instances on the server side
 * Following Clean Architecture pattern
 */

import { SupabaseDonationRepository } from "@/infrastructure/repositories/supabase/SupabaseDonationRepository";
import { createAdminSupabaseClient } from "@/infrastructure/supabase/admin";
import { DonationPresenter } from "./DonationPresenter";

/**
 * Factory for creating server-side DonationPresenter
 * Uses Supabase repository with admin client for webhook processing
 */
export function createServerDonationPresenter(): DonationPresenter {
  const adminClient = createAdminSupabaseClient();

  // Get Supabase credentials for repository
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }

  const donationRepo = new SupabaseDonationRepository(
    supabaseUrl,
    supabaseServiceKey,
  );

  return new DonationPresenter(donationRepo, adminClient);
}
