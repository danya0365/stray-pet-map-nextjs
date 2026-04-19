/**
 * PetPostPresenterServerFactory
 * Factory for creating PetPostPresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { PetPostPresenter } from "./PetPostPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";
// import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
// import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export class PetPostPresenterServerFactory {
  static create(): PetPostPresenter {
    // ✅ Use Mock Repository for development
    const repository = new MockPetPostRepository();

    // ⏳ TODO: Switch to Supabase Repository when backend is ready
    // const supabase = createServerSupabaseClient();
    // const repository = new SupabasePetPostRepository(supabase);

    return new PetPostPresenter(repository);
  }
}

export function createServerPetPostPresenter(): PetPostPresenter {
  return PetPostPresenterServerFactory.create();
}
