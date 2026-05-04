/**
 * AdoptionRequestPresenterServerFactory
 * Factory for creating AdoptionRequestPresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { SupabaseAdoptionRequestRepository } from "@/infrastructure/repositories/supabase/SupabaseAdoptionRequestRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { AdoptionRequestPresenter } from "./AdoptionRequestPresenter";

export class AdoptionRequestPresenterServerFactory {
  static async create(): Promise<AdoptionRequestPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabaseAdoptionRequestRepository(supabase);
    return new AdoptionRequestPresenter(repository);
  }
}

export async function createServerAdoptionRequestPresenter(): Promise<AdoptionRequestPresenter> {
  return await AdoptionRequestPresenterServerFactory.create();
}
