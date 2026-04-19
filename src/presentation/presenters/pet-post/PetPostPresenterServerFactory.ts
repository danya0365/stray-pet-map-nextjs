/**
 * PetPostPresenterServerFactory
 * Factory for creating PetPostPresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { PetPostPresenter } from "./PetPostPresenter";
// import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
// import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export class PetPostPresenterServerFactory {
  static async create(): Promise<PetPostPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetPostRepository(supabase);
    return new PetPostPresenter(repository);
  }
}

export async function createServerPetPostPresenter(): Promise<PetPostPresenter> {
  return PetPostPresenterServerFactory.create();
}
