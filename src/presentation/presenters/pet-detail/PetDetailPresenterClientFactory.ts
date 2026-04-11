"use client";

import { PetDetailPresenter } from "./PetDetailPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export class PetDetailPresenterClientFactory {
  static create(): PetDetailPresenter {
    const repository = new MockPetPostRepository();
    return new PetDetailPresenter(repository);
  }
}

export function createClientPetDetailPresenter(): PetDetailPresenter {
  return PetDetailPresenterClientFactory.create();
}
