/**
 * ProfilePresenterClientFactory
 * Factory for creating ProfilePresenter instances on the client side
 * ✅ Injects the appropriate repository (API Repository for client)
 */

"use client";

import { ProfilePresenter } from "./ProfilePresenter";
import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";

export class ProfilePresenterClientFactory {
  static create(): ProfilePresenter {
    // ✅ Use API Repository for client-side
    const repository = new ApiAuthRepository();

    return new ProfilePresenter(repository);
  }
}

export function createClientProfilePresenter(): ProfilePresenter {
  return ProfilePresenterClientFactory.create();
}
