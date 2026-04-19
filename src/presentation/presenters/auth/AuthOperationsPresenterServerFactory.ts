/**
 * AuthOperationsPresenterServerFactory
 * Factory for creating AuthOperationsPresenter instances on the server side
 * ✅ Injects the appropriate repository (Mock or Real)
 */

import { SupabaseAuthRepository } from "@/infrastructure/repositories/supabase/SupabaseAuthRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { AuthOperationsPresenter } from "./AuthOperationsPresenter";

export class AuthOperationsPresenterServerFactory {
  static async create(): Promise<AuthOperationsPresenter> {
    const supabase = await createServerSupabaseClient();
    const repository = new SupabaseAuthRepository(supabase);
    return new AuthOperationsPresenter(repository);
  }
}

export async function createServerAuthOperationsPresenter(): Promise<AuthOperationsPresenter> {
  return await AuthOperationsPresenterServerFactory.create();
}
