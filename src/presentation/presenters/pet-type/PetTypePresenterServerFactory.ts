/**
 * PetTypePresenterServerFactory
 * Factory for creating PetTypePresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { PetTypePresenter } from "./PetTypePresenter";

export class PetTypePresenterServerFactory {
  static async create(): Promise<PetTypePresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetTypeRepository(supabase);
    return new PetTypePresenter(repository);
  }
}

export async function createServerPetTypePresenter(): Promise<PetTypePresenter> {
  return await PetTypePresenterServerFactory.create();
}
