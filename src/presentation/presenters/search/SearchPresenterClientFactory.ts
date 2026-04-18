/**
 * SearchPresenterClientFactory
 * ✅ Uses ApiPetPostRepository — no direct Supabase access from client
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { SearchPresenter } from "./SearchPresenter";

export function createClientSearchPresenter(): SearchPresenter {
  const repository = new ApiPetPostRepository();
  return new SearchPresenter(repository);
}
