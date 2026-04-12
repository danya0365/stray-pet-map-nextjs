"use client";

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createClient } from "@/infrastructure/supabase/client";
import { MapPresenter } from "./MapPresenter";

export class MapPresenterClientFactory {
  static create(): MapPresenter {
    const supabase = createClient();
    const repository = new SupabasePetPostRepository(supabase);
    return new MapPresenter(repository);
  }
}

export function createClientMapPresenter(): MapPresenter {
  return MapPresenterClientFactory.create();
}
