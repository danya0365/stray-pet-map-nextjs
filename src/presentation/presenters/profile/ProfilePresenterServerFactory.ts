/**
 * ProfilePresenterServerFactory
 * Factory for creating ProfilePresenter instances on the server side
 * ✅ Injects the appropriate repositories (Supabase for server)
 * ✅ Following Clean Architecture - Dependency Injection pattern
 */

import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { SupabaseBadgeRepository } from "@/infrastructure/repositories/supabase/SupabaseBadgeRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { ProfilePresenter } from "./ProfilePresenter";

export class ProfilePresenterServerFactory {
  static async create(): Promise<ProfilePresenter> {
    // ✅ Use Supabase Repositories for server-side
    const supabase = await createServerSupabaseClient();
    const authRepository = new SupabaseAuthRepository(supabase);
    const badgeRepository = new SupabaseBadgeRepository(supabase);

    return new ProfilePresenter(authRepository, badgeRepository);
  }
}

export async function createServerProfilePresenter(): Promise<ProfilePresenter> {
  return ProfilePresenterServerFactory.create();
}
