import { PetDetailPresenter } from "./PetDetailPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export class PetDetailPresenterServerFactory {
  static create(): PetDetailPresenter {
    const repository = new MockPetPostRepository();
    return new PetDetailPresenter(repository);
  }
}

export function createServerPetDetailPresenter(): PetDetailPresenter {
  return PetDetailPresenterServerFactory.create();
}
