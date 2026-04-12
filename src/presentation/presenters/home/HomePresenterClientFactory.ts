"use client";

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createClient } from "@/infrastructure/supabase/client";
import { HomePresenter } from "./HomePresenter";

export class HomePresenterClientFactory {
  static create(): HomePresenter {
    const supabase = createClient();
    const repository = new SupabasePetPostRepository(supabase);
    return new HomePresenter(repository);
  }
}

export function createClientHomePresenter(): HomePresenter {
  return HomePresenterClientFactory.create();
}
