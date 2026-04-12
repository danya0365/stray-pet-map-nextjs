/**
 * CreatePostPresenterServerFactory
 * Factory for creating CreatePostPresenter on the server side
 * ✅ Injects Supabase repositories
 */

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { SupabaseStorageRepository } from "@/infrastructure/repositories/supabase/SupabaseStorageRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { CreatePostPresenter } from "./CreatePostPresenter";

export class CreatePostPresenterServerFactory {
  static async create(): Promise<CreatePostPresenter> {
    const supabase = await createServerSupabaseClient();
    const petPostRepository = new SupabasePetPostRepository(supabase);
    const petTypeRepository = new SupabasePetTypeRepository(supabase);
    const storageRepository = new SupabaseStorageRepository(supabase);
    return new CreatePostPresenter(
      petPostRepository,
      petTypeRepository,
      storageRepository,
    );
  }
}

export async function createServerCreatePostPresenter(): Promise<CreatePostPresenter> {
  return CreatePostPresenterServerFactory.create();
}
