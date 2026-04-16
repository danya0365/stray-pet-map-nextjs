/**
 * FavoritePresenterClientFactory
 * Factory for creating FavoritePresenter on the client side
 * ✅ Injects API repositories — no direct Supabase access
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiFavoriteRepository } from "@/infrastructure/repositories/api/ApiFavoriteRepository";
import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { FavoritePresenter } from "./FavoritePresenter";

export class FavoritePresenterClientFactory {
  static create(): FavoritePresenter {
    const favoriteRepository = new ApiFavoriteRepository();
    const petPostRepository = new ApiPetPostRepository();
    return new FavoritePresenter(favoriteRepository, petPostRepository);
  }
}

export function createClientFavoritePresenter(): FavoritePresenter {
  return FavoritePresenterClientFactory.create();
}
