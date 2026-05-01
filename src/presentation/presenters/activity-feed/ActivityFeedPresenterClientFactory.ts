"use client";

import { ApiActivityFeedRepository } from "@/infrastructure/repositories/api/ApiActivityFeedRepository";
import { ActivityFeedPresenter } from "./ActivityFeedPresenter";

export function createClientActivityFeedPresenter(): ActivityFeedPresenter {
  const repo = new ApiActivityFeedRepository();
  return new ActivityFeedPresenter(repo);
}
