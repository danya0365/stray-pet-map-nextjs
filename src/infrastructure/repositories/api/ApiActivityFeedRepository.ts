"use client";

import type {
  ActivityFeedQuery,
  IActivityFeedRepository,
} from "@/application/repositories/IActivityFeedRepository";
import type { ActivityFeedResult } from "@/domain/entities/activity";

export class ApiActivityFeedRepository implements IActivityFeedRepository {
  private baseUrl = "/api/feed";

  async getRecentActivities(
    query: ActivityFeedQuery,
  ): Promise<ActivityFeedResult> {
    const params = new URLSearchParams();
    params.set("limit", String(query.limit ?? 20));
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.types) params.set("types", query.types.join(","));

    const res = await fetch(`${this.baseUrl}?${params}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดกิจกรรมได้");
    }

    return res.json();
  }
}
