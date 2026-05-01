import type {
  ActivityFeedResult,
} from "@/domain/entities/activity";

export interface ActivityFeedQuery {
  limit?: number;
  cursor?: string;
  types?: string[];
}

export interface IActivityFeedRepository {
  /**
   * Get recent activities from posts, comments, and interactions
   * Merged and sorted by most recent first
   */
  getRecentActivities(query: ActivityFeedQuery): Promise<ActivityFeedResult>;
}
