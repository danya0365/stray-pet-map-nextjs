/**
 * ProfilePresenterClientFactory
 * Factory for creating ProfilePresenter instances on the client side
 * Injects the appropriate repositories (API for client-side)
 * Following Clean Architecture - Dependency Injection pattern
 */

"use client";

import type { IProfileBadgeRepository } from "@/application/repositories/IProfileBadgeRepository";
import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { ApiBadgeRepository } from "@/infrastructure/repositories/api/ApiBadgeRepository";
import { ProfilePresenter } from "./ProfilePresenter";

export class ProfilePresenterClientFactory {
  static create(): ProfilePresenter {
    // Use API Repositories for client-side (no direct Supabase connection)
    // This avoids connection pool issues
    const authRepository = new ApiAuthRepository();
    const badgeRepository: IProfileBadgeRepository = new ApiBadgeRepository();

    return new ProfilePresenter(authRepository, badgeRepository);
  }
}

export function createClientProfilePresenter(): ProfilePresenter {
  return ProfilePresenterClientFactory.create();
}
