"use client";

import { SearchPresenter } from "./SearchPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export function createClientSearchPresenter(): SearchPresenter {
  return new SearchPresenter(new MockPetPostRepository());
}
