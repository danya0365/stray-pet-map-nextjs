"use client";

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createClient } from "@/infrastructure/supabase/client";
import { SearchPresenter } from "./SearchPresenter";

export function createClientSearchPresenter(): SearchPresenter {
  const supabase = createClient();
  const repository = new SupabasePetPostRepository(supabase);
  return new SearchPresenter(repository);
}
