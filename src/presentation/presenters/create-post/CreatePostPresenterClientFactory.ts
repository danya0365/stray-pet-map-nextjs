/**
 * CreatePostPresenterClientFactory
 * Factory for creating CreatePostPresenter on the client side
 * ✅ Injects API repositories — no direct Supabase access
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { ApiPetTypeRepository } from "@/infrastructure/repositories/api/ApiPetTypeRepository";
import { ApiStorageRepository } from "@/infrastructure/repositories/api/ApiStorageRepository";
import { CreatePostPresenter } from "./CreatePostPresenter";

export class CreatePostPresenterClientFactory {
  static create(): CreatePostPresenter {
    const petPostRepository = new ApiPetPostRepository();
    const petTypeRepository = new ApiPetTypeRepository();
    const storageRepository = new ApiStorageRepository();
    return new CreatePostPresenter(
      petPostRepository,
      petTypeRepository,
      storageRepository,
    );
  }
}

export function createClientCreatePostPresenter(): CreatePostPresenter {
  return CreatePostPresenterClientFactory.create();
}
