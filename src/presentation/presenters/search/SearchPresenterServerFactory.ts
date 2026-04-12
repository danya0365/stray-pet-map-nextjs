import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { SearchPresenter } from "./SearchPresenter";

export async function createServerSearchPresenter(): Promise<SearchPresenter> {
  const supabase = await createServerSupabaseClient();
  const repository = new SupabasePetPostRepository(supabase);
  return new SearchPresenter(repository);
}
