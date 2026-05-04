/**
 * EditPostPresenterServerFactory
 * Factory for creating EditPostPresenter on the server side
 * Injects Supabase repositories
 */

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { EditPostPresenter } from "./EditPostPresenter";

export class EditPostPresenterServerFactory {
  static async create(): Promise<EditPostPresenter> {
    const supabase = await createServerSupabaseClient();
    const petPostRepository = new SupabasePetPostRepository(supabase);
    const petTypeRepository = new SupabasePetTypeRepository(supabase);
    return new EditPostPresenter(petPostRepository, petTypeRepository);
  }
}

export async function createServerEditPostPresenter(): Promise<EditPostPresenter> {
  return EditPostPresenterServerFactory.create();
}
