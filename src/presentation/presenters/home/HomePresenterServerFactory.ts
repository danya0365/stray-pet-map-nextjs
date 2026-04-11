import { HomePresenter } from "./HomePresenter";
import { MockPetPostRepository } from "@/infrastructure/repositories/mock/MockPetPostRepository";

export class HomePresenterServerFactory {
  static create(): HomePresenter {
    const repository = new MockPetPostRepository();

    // TODO: Switch to Supabase Repository when backend is ready
    // const supabase = createServerSupabaseClient();
    // const repository = new SupabasePetPostRepository(supabase);

    return new HomePresenter(repository);
  }
}

export function createServerHomePresenter(): HomePresenter {
  return HomePresenterServerFactory.create();
}
