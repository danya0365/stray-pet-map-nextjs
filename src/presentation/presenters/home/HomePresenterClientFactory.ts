"use client";

import { HomePresenter } from "./HomePresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export class HomePresenterClientFactory {
  static create(): HomePresenter {
    const repository = new MockPetPostRepository();

    // TODO: Switch to API Repository when backend is ready
    // const repository = new ApiPetPostRepository();

    return new HomePresenter(repository);
  }
}

export function createClientHomePresenter(): HomePresenter {
  return HomePresenterClientFactory.create();
}
