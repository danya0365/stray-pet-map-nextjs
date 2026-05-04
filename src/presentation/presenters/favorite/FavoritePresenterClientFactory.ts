/**
 * FavoritePresenterClientFactory
 * ✅ Uses ApiFavoriteRepository for production
 * ✅ Client → API Routes → Supabase
 */

"use client";

import { ApiFavoriteRepository } from "@/infrastructure/repositories/api/ApiFavoriteRepository";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createBrowserSupabaseClient } from "@/infrastructure/supabase/client";
import { FavoritePresenter } from "./FavoritePresenter";

export class FavoritePresenterClientFactory {
  static create(): FavoritePresenter {
    const supabase = createBrowserSupabaseClient();
    const favoriteRepo = new ApiFavoriteRepository();
    const petPostRepo = new SupabasePetPostRepository(supabase);
    return new FavoritePresenter(favoriteRepo, petPostRepo);
  }
}

export function createClientFavoritePresenter(): FavoritePresenter {
  return FavoritePresenterClientFactory.create();
}
