/**
 * PublicProfilePresenterClientFactory
 * ✅ Uses ApiPublicProfileRepository for production
 * ✅ Client → API Routes → Supabase
 */

"use client";

import { ApiPublicProfileRepository } from "@/infrastructure/repositories/api/ApiPublicProfileRepository";
import { PublicProfilePresenter } from "./PublicProfilePresenter";

export class PublicProfilePresenterClientFactory {
  static create(): PublicProfilePresenter {
    const repository = new ApiPublicProfileRepository();
    return new PublicProfilePresenter(repository);
  }
}

export function createClientPublicProfilePresenter(): PublicProfilePresenter {
  return PublicProfilePresenterClientFactory.create();
}
