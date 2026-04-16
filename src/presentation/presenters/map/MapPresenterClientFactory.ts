/**
 * MapPresenterClientFactory
 * ✅ Uses ApiPetPostRepository — no direct Supabase access from client
 * ✅ Client → ApiRepository → API Route → SupabaseRepository
 */

"use client";

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { MapPresenter } from "./MapPresenter";

export class MapPresenterClientFactory {
  static create(): MapPresenter {
    const repository = new ApiPetPostRepository();
    return new MapPresenter(repository);
  }
}

export function createClientMapPresenter(): MapPresenter {
  return MapPresenterClientFactory.create();
}
