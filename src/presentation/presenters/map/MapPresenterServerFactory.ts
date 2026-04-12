import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { MapPresenter } from "./MapPresenter";

export class MapPresenterServerFactory {
  static async create(): Promise<MapPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetPostRepository(supabase);
    return new MapPresenter(repository);
  }
}

export async function createServerMapPresenter(): Promise<MapPresenter> {
  return MapPresenterServerFactory.create();
}
