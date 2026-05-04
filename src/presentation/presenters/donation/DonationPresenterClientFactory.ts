/**
 * DonationPresenterClientFactory
 * Factory for creating DonationPresenter on the client side
 * ✅ Injects API repository — no direct Supabase access
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiDonationRepository } from "@/infrastructure/repositories/api/ApiDonationRepository";
import { DonationPresenter } from "./DonationPresenter";

export class DonationPresenterClientFactory {
  static create(): DonationPresenter {
    const donationRepository = new ApiDonationRepository();
    return new DonationPresenter(donationRepository);
  }
}

export function createClientDonationPresenter(): DonationPresenter {
  return DonationPresenterClientFactory.create();
}
