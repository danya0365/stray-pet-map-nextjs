/**
 * PetPostLikePresenterServerFactory
 * Factory for creating PetPostLikePresenter instances on the server side
 * ✅ Injects the Supabase repository
 */

import { SupabasePetPostLikeRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostLikeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { PetPostLikePresenter } from "./PetPostLikePresenter";

export class PetPostLikePresenterServerFactory {
  static async create(): Promise<PetPostLikePresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetPostLikeRepository(supabase);
    return new PetPostLikePresenter(repository);
  }
}

export async function createServerPetPostLikePresenter(): Promise<PetPostLikePresenter> {
  return PetPostLikePresenterServerFactory.create();
}
