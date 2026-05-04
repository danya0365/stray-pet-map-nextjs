/**
 * StoragePresenterClientFactory
 * Factory for creating StoragePresenter on the client side
 * ✅ Injects API repositories — no direct Supabase access
 * ✅ Client → ApiStorageRepository → API Route → SupabaseStorageRepository
 */

"use client";

import { ApiStorageRepository } from "@/infrastructure/repositories/api/ApiStorageRepository";
import { StoragePresenter } from "./StoragePresenter";

export class StoragePresenterClientFactory {
  /**
   * Create a StoragePresenter with client-side dependencies
   * Injects ApiStorageRepository configured for browser use
   */
  static create(): StoragePresenter {
    const storageRepo = new ApiStorageRepository();
    return new StoragePresenter(storageRepo);
  }
}

/**
 * Convenience function to create client-side storage presenter
 * Use this in Client Components and Hooks
 */
export function createClientStoragePresenter(): StoragePresenter {
  return StoragePresenterClientFactory.create();
}
