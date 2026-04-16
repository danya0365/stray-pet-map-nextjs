/**
 * RoadMapPresenterServerFactory
 * Factory for creating RoadMapPresenter instances on the server side
 */

import { RoadMapPresenter } from "./RoadMapPresenter";
import { MockRoadMapRepository } from "@/infrastructure/repositories/mock/MockRoadMapRepository";

export class RoadMapPresenterServerFactory {
  static create(): RoadMapPresenter {
    const repository = new MockRoadMapRepository();
    return new RoadMapPresenter(repository);
  }
}

export function createServerRoadMapPresenter(): RoadMapPresenter {
  return RoadMapPresenterServerFactory.create();
}
