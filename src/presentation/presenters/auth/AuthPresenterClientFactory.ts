/**
 * AuthPresenterClientFactory
 * Factory for creating AuthPresenter on the client side
 * ✅ Injects API repository — no direct Supabase access
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { AuthPresenter } from "./AuthPresenter";

export class AuthPresenterClientFactory {
  static create(): AuthPresenter {
    const authRepository = new ApiAuthRepository();
    return new AuthPresenter(authRepository);
  }
}

export function createClientAuthPresenter(): AuthPresenter {
  return AuthPresenterClientFactory.create();
}
