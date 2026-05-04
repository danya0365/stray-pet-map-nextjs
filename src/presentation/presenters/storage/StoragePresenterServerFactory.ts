/**
 * StoragePresenterServerFactory
 * Factory for creating StoragePresenter instances on the server side
 * Following Clean Architecture - Dependency Injection pattern
 */

import { SupabaseStorageRepository } from "@/infrastructure/repositories/supabase/SupabaseStorageRepository";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";
import { StoragePresenter } from "./StoragePresenter";

export class StoragePresenterServerFactory {
  /**
   * Create a StoragePresenter with server-side dependencies
   * Injects Supabase repositories configured for server use
   * NOTE: Auth check should be done in API Route before calling presenter methods
   */
  static async create(): Promise<StoragePresenter> {
    const supabase = await createServerSupabaseClient();
    const storageRepo = new SupabaseStorageRepository(supabase);
    return new StoragePresenter(storageRepo);
  }
}

/**
 * Convenience function to create server-side storage presenter
 * Use this in API Routes and Server Components
 */
export async function createServerStoragePresenter(): Promise<StoragePresenter> {
  return StoragePresenterServerFactory.create();
}
