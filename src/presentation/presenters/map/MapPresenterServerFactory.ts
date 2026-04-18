import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { SupabasePetTypeRepository } from "@/infrastructure/repositories/supabase/SupabasePetTypeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { MapPresenter } from "./MapPresenter";

export class MapPresenterServerFactory {
  static async create(): Promise<MapPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetPostRepository(supabase);
    const petTypeRepository = new SupabasePetTypeRepository(supabase);
    return new MapPresenter(repository, petTypeRepository);
  }
}

export async function createServerMapPresenter(): Promise<MapPresenter> {
  return MapPresenterServerFactory.create();
}
