import { SearchPresenter } from "./SearchPresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export function createServerSearchPresenter(): SearchPresenter {
  return new SearchPresenter(new MockPetPostRepository());
}
