/**
 * ProfilePresenterServerFactory
 * Factory for creating ProfilePresenter instances on the server side
 * ✅ Injects the appropriate repository (Supabase for server)
 */

import { ProfilePresenter } from "./ProfilePresenter";
import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export class ProfilePresenterServerFactory {
  static async create(): Promise<ProfilePresenter> {
    // ✅ Use Supabase Repository for server-side
    const supabase = await createServerSupabaseClient();
    const repository = new SupabaseAuthRepository(supabase);

    return new ProfilePresenter(repository);
  }
}

export async function createServerProfilePresenter(): Promise<ProfilePresenter> {
  return ProfilePresenterServerFactory.create();
}
