/**
 * PetPostLikePresenterClientFactory
 * ✅ Uses ApiPetPostLikeRepository for production
 * ✅ Client → API Routes → Supabase
 */

"use client";

import { ApiPetPostLikeRepository } from "@/infrastructure/repositories/api/ApiPetPostLikeRepository";
import { PetPostLikePresenter } from "./PetPostLikePresenter";

export class PetPostLikePresenterClientFactory {
  static create(): PetPostLikePresenter {
    const repository = new ApiPetPostLikeRepository();
    return new PetPostLikePresenter(repository);
  }
}

export function createClientPetPostLikePresenter(): PetPostLikePresenter {
  return PetPostLikePresenterClientFactory.create();
}
