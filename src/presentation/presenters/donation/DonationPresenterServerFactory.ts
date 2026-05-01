/**
 * DonationPresenterServerFactory
 * Factory for creating DonationPresenter instances for Server Components
 * Uses Supabase server client with cookies (respects RLS)
 * Following Clean Architecture pattern
 */

import { SupabaseDonationRepository } from "@/infrastructure/repositories/supabase/SupabaseDonationRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { DonationPresenter } from "./DonationPresenter";

/**
 * Factory for creating DonationPresenter for Server Components
 * Uses Supabase server client with cookies
 */
export async function createServerDonationPresenter(): Promise<DonationPresenter> {
  const supabase = await createServerSupabaseClient();
  const donationRepo = new SupabaseDonationRepository(supabase);

  return new DonationPresenter(donationRepo);
}
