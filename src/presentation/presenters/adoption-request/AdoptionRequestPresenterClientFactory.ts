/**
 * AdoptionRequestPresenterClientFactory
 * ✅ Uses ApiAdoptionRequestRepository for production
 * ✅ Client → API Routes → Supabase
 */

"use client";

import { ApiAdoptionRequestRepository } from "@/infrastructure/repositories/api/ApiAdoptionRequestRepository";
import { AdoptionRequestPresenter } from "./AdoptionRequestPresenter";

export class AdoptionRequestPresenterClientFactory {
  static create(): AdoptionRequestPresenter {
    const repository = new ApiAdoptionRequestRepository();
    return new AdoptionRequestPresenter(repository);
  }
}

export function createClientAdoptionRequestPresenter(): AdoptionRequestPresenter {
  return AdoptionRequestPresenterClientFactory.create();
}
