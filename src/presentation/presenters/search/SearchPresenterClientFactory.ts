/**
 * SearchPresenterClientFactory
 * ✅ Uses ApiPetPostRepository — no direct Supabase access from client
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { ApiPetTypeRepository } from "@/infrastructure/repositories/api/ApiPetTypeRepository";
import { SearchPresenter } from "./SearchPresenter";

export function createClientSearchPresenter(): SearchPresenter {
  const repository = new ApiPetPostRepository();
  const petTypeRepository = new ApiPetTypeRepository();
  return new SearchPresenter(repository, petTypeRepository);
}
