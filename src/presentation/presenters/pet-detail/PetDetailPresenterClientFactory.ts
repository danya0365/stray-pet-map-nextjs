/**
 * PetDetailPresenterClientFactory
 * ✅ Uses ApiPetPostRepository — no direct Supabase access from client
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiDonationRepository } from "@/infrastructure/repositories/api/ApiDonationRepository";
import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { PetDetailPresenter } from "./PetDetailPresenter";

export class PetDetailPresenterClientFactory {
  static create(): PetDetailPresenter {
    const repository = new ApiPetPostRepository();
    const donationRepository = new ApiDonationRepository();
    return new PetDetailPresenter(repository, donationRepository);
  }
}

export function createClientPetDetailPresenter(): PetDetailPresenter {
  return PetDetailPresenterClientFactory.create();
}
