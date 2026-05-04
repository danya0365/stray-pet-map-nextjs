/**
 * ActivityFeedPresenter
 * Presentation layer for activity feed
 */

import type {
  ActivityFeedQuery,
  IActivityFeedRepository,
} from "@/application/repositories/IActivityFeedRepository";
import type { ActivityFeedResult } from "@/domain/entities/activity";

export interface ActivityFeedPresenterResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ActivityFeedPresenter {
  constructor(private readonly repository: IActivityFeedRepository) {}

  async getFeed(
    query: ActivityFeedQuery,
  ): Promise<ActivityFeedPresenterResult<ActivityFeedResult>> {
    try {
      const result = await this.repository.getRecentActivities(query);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch feed",
      };
    }
  }
}
