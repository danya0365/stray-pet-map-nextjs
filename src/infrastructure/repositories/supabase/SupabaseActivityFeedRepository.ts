/**
 * SupabaseActivityFeedRepository
 * Queries the activity_feed_items materialized view for O(1) feed reads.
 * View refreshes via triggers on pet_posts/comments writes.
 * Clean Architecture — Infrastructure layer
 */

import type {
  ActivityFeedQuery,
  IActivityFeedRepository,
} from "@/application/repositories/IActivityFeedRepository";
import type {
  ActivityFeedResult,
  ActivityItem,
  ActivityPayload,
  ActivityType,
} from "@/domain/entities/activity";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Types from Supabase schema
type ActivityFeedRow =
  Database["public"]["Views"]["activity_feed_items"]["Row"];

export class SupabaseActivityFeedRepository implements IActivityFeedRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getRecentActivities(
    query: ActivityFeedQuery,
  ): Promise<ActivityFeedResult> {
    const limit = query.limit ?? 20;

    let q = this.supabase
      .from("activity_feed_items")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (query.cursor) {
      q = q.lt("occurred_at", query.cursor);
    }

    if (query.types && query.types.length > 0) {
      q = q.in("type", query.types);
    }

    const { data, error } = await q;

    if (error) {
      console.error("ActivityFeed view query error:", error);
      throw new Error(error.message || "ไม่สามารถโหลดกิจกรรมได้");
    }

    const rows = (data ?? []) as ActivityFeedRow[];

    const items: ActivityItem[] = rows.map((r) => {
      const type = this.mapType(r.type!, r.post_outcome);

      const payload: ActivityPayload = {
        postId: r.post_id ?? undefined,
        postTitle: r.post_title ?? undefined,
        postThumbnailUrl: r.post_thumbnail ?? undefined,
        postPurpose: r.post_purpose ?? undefined,
        postStatus: r.post_status ?? undefined,
        postOutcome: r.post_outcome ?? undefined,
        commentId: r.comment_id ?? undefined,
        commentContent: r.comment_content ?? undefined,
        parentCommentId: r.parent_comment_id ?? undefined,
      };

      const occurredAt = r.occurred_at || new Date().toISOString();

      return {
        id: r.id!,
        type,
        actor: {
          id: r.actor_id!,
          displayName: r.actor_name || "ผู้ใช้",
          avatarUrl: r.actor_avatar ?? undefined,
          level: r.actor_level ?? 1,
        },
        payload,
        occurredAt,
        createdAt: occurredAt,
        updatedAt: occurredAt,
      };
    });

    const hasMore = items.length === limit;
    const nextCursor = hasMore
      ? items[items.length - 1]?.occurredAt
      : undefined;

    return { items, hasMore, nextCursor };
  }

  private mapType(rawType: string, outcome: string | null): ActivityType {
    if (
      rawType === "new_post" &&
      (outcome === "owner_found" || outcome === "rehomed")
    ) {
      return "status_changed";
    }
    return rawType as ActivityType;
  }
}
