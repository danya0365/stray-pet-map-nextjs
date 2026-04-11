import { MapPresenter } from "./MapPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export class MapPresenterServerFactory {
  static create(): MapPresenter {
    const repository = new MockPetPostRepository();

    // TODO: Switch to Supabase Repository when backend is ready

    return new MapPresenter(repository);
  }
}

export function createServerMapPresenter(): MapPresenter {
  return MapPresenterServerFactory.create();
}
