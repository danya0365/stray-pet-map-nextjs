import { SupabaseDonationRepository } from "@/infrastructure/repositories/supabase/SupabaseDonationRepository";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { PetDetailPresenter } from "./PetDetailPresenter";

export class PetDetailPresenterServerFactory {
  static async create(): Promise<PetDetailPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePetPostRepository(supabase);
    const donationRepository = new SupabaseDonationRepository(supabase);
    return new PetDetailPresenter(repository, donationRepository);
  }
}

export async function createServerPetDetailPresenter(): Promise<PetDetailPresenter> {
  return PetDetailPresenterServerFactory.create();
}
