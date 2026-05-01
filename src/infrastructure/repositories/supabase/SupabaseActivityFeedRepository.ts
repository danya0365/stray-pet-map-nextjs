/**
 * SupabaseActivityFeedRepository
 * Merges pet_posts + comments into a unified activity feed
 * Clean Architecture - Infrastructure layer
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

export class SupabaseActivityFeedRepository implements IActivityFeedRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getRecentActivities(
    query: ActivityFeedQuery,
  ): Promise<ActivityFeedResult> {
    const limit = query.limit ?? 20;

    // Fetch recent posts (with owner profile)
    let postQuery = this.supabase
      .from("pet_posts")
      .select(
        `
        id, title, description, purpose, status, outcome,
        thumbnail_url, province, created_at, updated_at,
        profile_id,
        profiles:profile_id (id, full_name, avatar_url, level)
      `,
      )
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (query.cursor) {
      postQuery = postQuery.lt("updated_at", query.cursor);
    }

    // Fetch recent comments (with profile)
    let commentQuery = this.supabase
      .from("comments")
      .select(
        `
        id, content, pet_post_id, parent_comment_id, created_at,
        profile_id,
        profiles:profile_id (id, full_name, avatar_url, level)
      `,
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (query.cursor) {
      commentQuery = commentQuery.lt("created_at", query.cursor);
    }

    const [
      { data: posts, error: postError },
      { data: comments, error: commentError },
    ] = await Promise.all([postQuery, commentQuery]);

    if (postError) console.error("ActivityFeed post fetch error:", postError);
    if (commentError)
      console.error("ActivityFeed comment fetch error:", commentError);

    // Build activity items from posts
    const postItems: ActivityItem[] = (posts || []).map((p) => {
      const profiles = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
      const outcome = p.outcome;
      const status = p.status;

      let type: ActivityType = "new_post";
      if (outcome === "owner_found" || outcome === "rehomed") {
        type = "status_changed";
      }

      const payload: ActivityPayload = {
        postId: p.id,
        postTitle: p.title,
        postThumbnailUrl: p.thumbnail_url ?? undefined,
        postPurpose: p.purpose ?? undefined,
        postStatus: status ?? undefined,
        postOutcome: outcome ?? undefined,
      };

      return {
        id: `post_${p.id}`,
        type,
        actor: {
          id: profiles?.id ?? p.profile_id,
          displayName: profiles?.full_name ?? "ผู้ใช้",
          avatarUrl: profiles?.avatar_url ?? undefined,
          level: profiles?.level ?? 1,
        },
        payload,
        occurredAt: (p.updated_at ?? p.created_at) || new Date().toISOString(),
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: (p.updated_at ?? p.created_at) || new Date().toISOString(),
      };
    });

    // Build activity items from comments
    const commentItems: ActivityItem[] = (comments || []).map((c) => {
      const profiles = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      const isReply = !!c.parent_comment_id;

      const type: ActivityType = isReply ? "comment_reply" : "new_comment";
      const payload: ActivityPayload = {
        postId: c.pet_post_id,
        commentId: c.id,
        commentContent: c.content,
        parentCommentId: c.parent_comment_id ?? undefined,
      };

      return {
        id: `comment_${c.id}`,
        type,
        actor: {
          id: profiles?.id ?? c.profile_id,
          displayName: profiles?.full_name ?? "ผู้ใช้",
          avatarUrl: profiles?.avatar_url ?? undefined,
          level: profiles?.level ?? 1,
        },
        payload,
        occurredAt: c.created_at || new Date().toISOString(),
        createdAt: c.created_at || new Date().toISOString(),
        updatedAt: c.created_at || new Date().toISOString(),
      };
    });

    // Merge and sort by occurredAt desc
    let allItems = [...postItems, ...commentItems];
    allItems.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    // Apply type filter if provided
    if (query.types && query.types.length > 0) {
      allItems = allItems.filter((item) => query.types!.includes(item.type));
    }

    // Slice to limit
    const items = allItems.slice(0, limit);
    const hasMore = allItems.length > limit;
    const nextCursor = hasMore
      ? items[items.length - 1]?.occurredAt
      : undefined;

    return { items, hasMore, nextCursor };
  }
}
