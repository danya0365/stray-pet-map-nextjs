/**
 * HomePresenterClientFactory
 * ✅ Uses ApiPetPostRepository — no direct Supabase access from client
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { HomePresenter } from "./HomePresenter";

export class HomePresenterClientFactory {
  static create(): HomePresenter {
    const repository = new ApiPetPostRepository();
    return new HomePresenter(repository);
  }
}

export function createClientHomePresenter(): HomePresenter {
  return HomePresenterClientFactory.create();
}
