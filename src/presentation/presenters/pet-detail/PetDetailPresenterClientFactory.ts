/**
 * PetDetailPresenterClientFactory
 * ✅ Uses ApiPetPostRepository — no direct Supabase access from client
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { PetDetailPresenter } from "./PetDetailPresenter";

export class PetDetailPresenterClientFactory {
  static create(): PetDetailPresenter {
    const repository = new ApiPetPostRepository();
    return new PetDetailPresenter(repository);
  }
}

export function createClientPetDetailPresenter(): PetDetailPresenter {
  return PetDetailPresenterClientFactory.create();
}
