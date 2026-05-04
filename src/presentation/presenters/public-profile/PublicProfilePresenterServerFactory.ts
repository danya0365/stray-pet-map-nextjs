/**
 * PublicProfilePresenterServerFactory
 * Factory for creating PublicProfilePresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { SupabasePublicProfileRepository } from "@/infrastructure/repositories/supabase/SupabasePublicProfileRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { PublicProfilePresenter } from "./PublicProfilePresenter";

export class PublicProfilePresenterServerFactory {
  static async create(): Promise<PublicProfilePresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabasePublicProfileRepository(supabase);
    return new PublicProfilePresenter(repository);
  }
}

export async function createServerPublicProfilePresenter(): Promise<PublicProfilePresenter> {
  return await PublicProfilePresenterServerFactory.create();
}
