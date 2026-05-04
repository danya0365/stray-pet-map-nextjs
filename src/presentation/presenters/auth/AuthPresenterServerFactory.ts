import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { AuthPresenter } from "./AuthPresenter";

export class AuthPresenterServerFactory {
  static async create(): Promise<AuthPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabaseAuthRepository(supabase);
    return new AuthPresenter(repository);
  }
}

export async function createServerAuthPresenter(): Promise<AuthPresenter> {
  return AuthPresenterServerFactory.create();
}
