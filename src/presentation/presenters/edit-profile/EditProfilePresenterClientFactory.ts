/**
 * EditProfilePresenterClientFactory
 * Factory for creating EditProfilePresenter on the client side
 * Injects repositories directly into presenter (Clean Architecture)
 */

"use client";

import { ApiAuthRepository } from "@/infrastructure/repositories/api/ApiAuthRepository";
import { ApiStorageRepository } from "@/infrastructure/repositories/api/ApiStorageRepository";
import { EditProfilePresenter } from "./EditProfilePresenter";

export class EditProfilePresenterClientFactory {
  static create(): EditProfilePresenter {
    const authRepo = new ApiAuthRepository();
    const storageRepo = new ApiStorageRepository();

    return new EditProfilePresenter(authRepo, storageRepo);
  }
}

export function createClientEditProfilePresenter(): EditProfilePresenter {
  return EditProfilePresenterClientFactory.create();
}
