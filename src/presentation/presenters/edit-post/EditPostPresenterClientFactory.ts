/**
 * EditPostPresenterClientFactory
 * Factory for creating EditPostPresenter on the client side
 * Injects API repositories
 */

import { ApiPetPostRepository } from "@/infrastructure/repositories/api/ApiPetPostRepository";
import { ApiPetTypeRepository } from "@/infrastructure/repositories/api/ApiPetTypeRepository";
import { EditPostPresenter } from "./EditPostPresenter";

export class EditPostPresenterClientFactory {
  static create(): EditPostPresenter {
    const petPostRepository = new ApiPetPostRepository();
    const petTypeRepository = new ApiPetTypeRepository();
    return new EditPostPresenter(petPostRepository, petTypeRepository);
  }
}

export function createClientEditPostPresenter(): EditPostPresenter {
  return EditPostPresenterClientFactory.create();
}
