"use client";

import { MapPresenter } from "./MapPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export class MapPresenterClientFactory {
  static create(): MapPresenter {
    const repository = new MockPetPostRepository();

    // TODO: Switch to API Repository when backend is ready

    return new MapPresenter(repository);
  }
}

export function createClientMapPresenter(): MapPresenter {
  return MapPresenterClientFactory.create();
}
