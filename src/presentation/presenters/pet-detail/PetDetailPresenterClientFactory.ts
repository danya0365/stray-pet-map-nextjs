"use client";

import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createClient } from "@/infrastructure/supabase/client";
import { PetDetailPresenter } from "./PetDetailPresenter";

export class PetDetailPresenterClientFactory {
  static create(): PetDetailPresenter {
    const supabase = createClient();
    const repository = new SupabasePetPostRepository(supabase);
    return new PetDetailPresenter(repository);
  }
}

export function createClientPetDetailPresenter(): PetDetailPresenter {
  return PetDetailPresenterClientFactory.create();
}
