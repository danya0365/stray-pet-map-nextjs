/**
 * ProfilePresenterClientFactory
 * Factory for creating ProfilePresenter instances on the client side
 * Injects the appropriate repositories (API for client-side)
 * Following Clean Architecture - Dependency Injection pattern
 */

"use client";

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { ApiProfileBadgeRepository } from "@/infrastructure/repositories/api/ApiProfileBadgeRepository";
import { ProfilePresenter } from "./ProfilePresenter";

export class ProfilePresenterClientFactory {
  static create(): ProfilePresenter {
    // Use API Repositories for client-side (no direct Supabase connection)
    // This avoids connection pool issues
    const authRepository = new ApiAuthRepository();
    const badgeRepository = new ApiProfileBadgeRepository();
    const petPostRepository = new ApiPetPostRepository();

    return new ProfilePresenter(
      authRepository,
      badgeRepository,
      petPostRepository,
    );
  }
}

export function createClientProfilePresenter(): ProfilePresenter {
  return ProfilePresenterClientFactory.create();
}
