import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { HomePresenter } from "./HomePresenter";

export class HomePresenterServerFactory {
  static async create(): Promise<HomePresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetPostRepository(supabase);
    return new HomePresenter(repository);
  }
}

export async function createServerHomePresenter(): Promise<HomePresenter> {
  return HomePresenterServerFactory.create();
}
