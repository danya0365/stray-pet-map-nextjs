/**
 * FavoritePresenterServerFactory
 * Factory for creating FavoritePresenter instances on the server side
 * ✅ Injects the appropriate repositories (Mock or Real)
 */

import { SupabaseFavoriteRepository } from "@/infrastructure/repositories/supabase/SupabaseFavoriteRepository";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { FavoritePresenter } from "./FavoritePresenter";

export class FavoritePresenterServerFactory {
  static async create(): Promise<FavoritePresenter> {
    const supabase = await createServerSupabaseClient();
    const favoriteRepo = new SupabaseFavoriteRepository(supabase);
    const petPostRepo = new SupabasePetPostRepository(supabase);

    return new FavoritePresenter(favoriteRepo, petPostRepo);
  }
}

export async function createServerFavoritePresenter(): Promise<FavoritePresenter> {
  return await FavoritePresenterServerFactory.create();
}
