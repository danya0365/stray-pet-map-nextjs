/**
 * SupabaseCommentRepository
 * Supabase implementation of ICommentRepository
 * Following Clean Architecture - Infrastructure layer
 */

import type { ICommentRepository } from "@/application/repositories/ICommentRepository";
import type {
  Comment,
  CommentGamificationInfo,
  CommentListOptions,
  CommentReactionType,
  CommentReplyOptions,
  CommentThread,
  CreateCommentData,
  UpdateCommentData,
} from "@/domain/entities/comment";
import {
  COMMENT_CONSTRAINTS,
  defaultReactionCounts,
} from "@/domain/entities/comment";
import type {
  CommentLeaderboardEntry,
  CommentLeaderboardPeriod,
  UserCommentStats,
} from "@/domain/entities/comment-stats";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class SupabaseCommentRepository implements ICommentRepository {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  async create(data: CreateCommentData, profileId: string): Promise<Comment> {
    const { data: result, error } = await this.supabase
      .from("comments")
      .insert({
        pet_post_id: data.petPostId,
        profile_id: profileId,
        parent_comment_id: data.parentCommentId || null,
        content: data.content,
        is_edited: false,
        is_deleted: false,
        reply_count: 0,
        like_count: 0,
      })
      .select(
        `
        *,
        profiles:profile_id (id, display_name, avatar_url, level)
      `,
      )
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return this.mapToComment(result);
  }

  async findById(id: string): Promise<Comment | null> {
    const { data, error } = await this.supabase
      .from("comments")
      .select(
        `
        *,
        profiles:profile_id (id, display_name, avatar_url, level)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToComment(data);
  }

  async findByPetPostId(
    petPostId: string,
    options: CommentListOptions = {},
  ): Promise<CommentThread> {
    const {
      cursor,
      limit = COMMENT_CONSTRAINTS.PAGE_SIZE.TOP_LEVEL,
      sortBy = "newest",
    } = options;

    let query = this.supabase
      .from("comments")
      .select(
        `
        *,
        profiles:profile_id (id, display_name, avatar_url, level)
      `,
        { count: "exact" },
      )
      .eq("pet_post_id", petPostId)
      .is("parent_comment_id", null)
      .eq("is_deleted", false);

    // Sort
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortBy === "popular") {
      query = query.order("like_count", { ascending: false });
    }

    // Pagination
    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      if (sortBy === "newest") {
        query = query.lt("created_at", decodedCursor);
      } else if (sortBy === "oldest") {
        query = query.gt("created_at", decodedCursor);
      }
    }

    query = query.limit(limit + 1); // Fetch one extra to check hasMore

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching comments:", error);
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    const comments = (data || []).slice(0, limit);
    const hasMore = (data || []).length > limit;
    const nextCursor =
      hasMore && comments.length > 0
        ? this.encodeCursor(comments[comments.length - 1].created_at)
        : undefined;

    // Fetch reactions for these comments
    const commentIds = comments.map((c: unknown) => (c as { id: string }).id);
    const reactions = await this.fetchReactionsForComments(commentIds);

    // Map comments with author info and reactions
    const mappedComments = comments.map((c: unknown) => {
      const comment = this.mapToComment(c as Record<string, unknown>);
      comment.reactionCounts =
        reactions.get(comment.id) || defaultReactionCounts;
      return comment;
    });

    return {
      petPostId,
      totalComments: count || 0,
      topLevelComments: mappedComments,
      hasMore,
      nextCursor,
    };
  }

  async update(
    id: string,
    data: UpdateCommentData,
    profileId: string,
  ): Promise<Comment> {
    const { data: result, error } = await this.supabase
      .from("comments")
      .update({
        content: data.content,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("profile_id", profileId)
      .eq("is_deleted", false)
      .select(
        `
        *,
        profiles:profile_id (id, display_name, avatar_url, level)
      `,
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error(
          "Comment not found or you don't have permission to edit",
        );
      }
      console.error("Error updating comment:", error);
      throw new Error(`Failed to update comment: ${error.message}`);
    }

    return this.mapToComment(result);
  }

  async softDelete(
    id: string,
    profileId: string,
    reason: "self" | "moderator",
  ): Promise<void> {
    const { error } = await this.supabase
      .from("comments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_reason: reason,
        content: "[ถูกลบ]", // Clear content for privacy
      })
      .eq("id", id)
      .eq("profile_id", profileId)
      .eq("is_deleted", false);

    if (error) {
      console.error("Error deleting comment:", error);
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  // ============================================================================
  // Thread Operations
  // ============================================================================

  async findReplies(
    parentCommentId: string,
    options: CommentReplyOptions = {},
  ): Promise<Comment[]> {
    const { cursor, limit = COMMENT_CONSTRAINTS.PAGE_SIZE.REPLIES } = options;

    let query = this.supabase
      .from("comments")
      .select(
        `
        *,
        profiles:profile_id (id, display_name, avatar_url, level)
      `,
      )
      .eq("parent_comment_id", parentCommentId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (cursor) {
      query = query.gt("created_at", this.decodeCursor(cursor));
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching replies:", error);
      throw new Error(`Failed to fetch replies: ${error.message}`);
    }

    return (data || []).map(this.mapToComment);
  }

  async getThreadTree(
    commentId: string,
    maxDepth = 5,
  ): Promise<Comment | null> {
    // First, get the root comment
    const { data: rootComment, error: rootError } = await this.supabase
      .from("comments")
      .select(
        `
        *,
        profiles:profile_id (id, display_name, avatar_url, level)
      `,
      )
      .eq("id", commentId)
      .single();

    if (rootError || !rootComment) return null;

    // Build tree using recursive query via RPC
    const { data: treeData, error: treeError } = await this.supabase.rpc(
      "get_comment_thread",
      { root_comment_id: commentId, max_depth: maxDepth },
    );

    if (treeError) {
      console.error("Error fetching thread tree:", treeError);
      // Fallback: return root without tree
      return this.mapToComment(rootComment);
    }

    // Build nested structure
    return this.buildCommentTree(rootComment, treeData || []);
  }

  // ============================================================================
  // Engagement Operations
  // ============================================================================

  async addLike(commentId: string, profileId: string): Promise<void> {
    const { error } = await this.supabase
      .from("comment_likes")
      .insert({
        comment_id: commentId,
        profile_id: profileId,
      })
      .select()
      .single();

    if (error && error.code !== "23505") {
      // 23505 = unique violation (already liked)
      console.error("Error adding like:", error);
      throw new Error(`Failed to add like: ${error.message}`);
    }
  }

  async removeLike(commentId: string, profileId: string): Promise<void> {
    const { error } = await this.supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error removing like:", error);
      throw new Error(`Failed to remove like: ${error.message}`);
    }
  }

  async addReaction(
    commentId: string,
    profileId: string,
    type: CommentReactionType,
  ): Promise<void> {
    // Upsert reaction (replace if exists)
    const { error } = await this.supabase.from("comment_reactions").upsert(
      {
        comment_id: commentId,
        profile_id: profileId,
        reaction_type: type,
      },
      {
        onConflict: "comment_id,profile_id",
      },
    );

    if (error) {
      console.error("Error adding reaction:", error);
      throw new Error(`Failed to add reaction: ${error.message}`);
    }
  }

  async removeReaction(commentId: string, profileId: string): Promise<void> {
    const { error } = await this.supabase
      .from("comment_reactions")
      .delete()
      .eq("comment_id", commentId)
      .eq("profile_id", profileId);

    if (error) {
      console.error("Error removing reaction:", error);
      throw new Error(`Failed to remove reaction: ${error.message}`);
    }
  }

  async hasLiked(commentId: string, profileId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) {
      console.error("Error checking like:", error);
      return false;
    }

    return !!data;
  }

  async getUserReaction(
    commentId: string,
    profileId: string,
  ): Promise<CommentReactionType | null> {
    const { data, error } = await this.supabase
      .from("comment_reactions")
      .select("reaction_type")
      .eq("comment_id", commentId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error || !data) return null;
    return data.reaction_type as CommentReactionType;
  }

  // ============================================================================
  // Statistics & Gamification
  // ============================================================================

  async getUserStats(profileId: string): Promise<UserCommentStats> {
    const { data, error } = await this.supabase
      .from("user_comment_stats")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error || !data) {
      // Return default stats if not found
      return {
        profileId,
        totalComments: 0,
        totalReplies: 0,
        totalReceivedReplies: 0,
        totalLikesReceived: 0,
        totalLikesGiven: 0,
        totalHelpfulReceived: 0,
        avgReplyDepth: 0,
        helpfulComments: 0,
        currentCommentStreak: 0,
        longestCommentStreak: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    return this.mapToUserCommentStats(data);
  }

  async getLeaderboard(
    period: CommentLeaderboardPeriod,
    limit = 10,
  ): Promise<CommentLeaderboardEntry[]> {
    const viewName =
      period === "week"
        ? "comment_leaderboard_weekly"
        : period === "month"
          ? "comment_leaderboard_monthly"
          : "comment_leaderboard_alltime";

    const { data, error } = await this.supabase
      .from(viewName)
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    return (data || []).map((entry: unknown, index: number) =>
      this.mapToLeaderboardEntry(entry as Record<string, unknown>, index + 1),
    );
  }

  async getGamificationInfo(
    profileId: string,
    action: "comment_created" | "reply_created",
  ): Promise<CommentGamificationInfo> {
    // Get points from today's gamification log
    const today = new Date().toISOString().split("T")[0];
    const { data: logData, error: logError } = await this.supabase
      .from("comment_gamification_log")
      .select("action, points_awarded, metadata")
      .eq("profile_id", profileId)
      .gte("created_at", today)
      .order("created_at", { ascending: false })
      .limit(5);

    if (logError) {
      console.error("Error fetching gamification log:", logError);
    }

    // Get user stats for streak info
    const { data: statsData, error: statsError } = await this.supabase
      .from("user_comment_stats")
      .select("current_comment_streak, longest_comment_streak")
      .eq("profile_id", profileId)
      .single();

    if (statsError) {
      console.error("Error fetching user stats:", statsError);
    }

    // Calculate points earned
    const relevantLogs = (logData || []).filter(
      (log: { action: string }) => log.action === action,
    );
    const pointsEarned = relevantLogs.reduce(
      (sum: number, log: { points_awarded: number }) =>
        sum + log.points_awarded,
      0,
    );

    // Check for streak bonus
    let streakBonus: number | undefined;
    const streak = statsData?.current_comment_streak || 0;
    if (streak === 3) streakBonus = 5;
    else if (streak === 7) streakBonus = 15;
    else if (streak === 14) streakBonus = 30;
    else if (streak === 30) streakBonus = 50;
    else if (streak === 60) streakBonus = 100;
    else if (streak === 100) streakBonus = 200;

    return {
      pointsEarned,
      streakBonus,
      streakUpdated: statsData
        ? {
            current: statsData.current_comment_streak,
            longest: statsData.longest_comment_streak,
          }
        : undefined,
    };
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async countByPetPostId(petPostId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("pet_post_id", petPostId)
      .eq("is_deleted", false);

    if (error) {
      console.error("Error counting comments:", error);
      return 0;
    }

    return count || 0;
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("comments")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error checking comment existence:", error);
      return false;
    }

    return !!data;
  }

  async getCommentDepth(commentId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc("get_comment_depth", {
      comment_id: commentId,
    });

    if (error) {
      console.error("Error getting comment depth:", error);
      return 0;
    }

    return data || 0;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private mapToComment(data: Record<string, unknown>): Comment {
    const profile = data.profiles as Record<string, unknown> | undefined;

    return {
      id: data.id as string,
      petPostId: data.pet_post_id as string,
      profileId: data.profile_id as string,
      author: {
        profileId: (profile?.id as string) || (data.profile_id as string),
        displayName: (profile?.display_name as string) || "ผู้ใช้",
        avatarUrl: profile?.avatar_url as string | undefined,
        level: (profile?.level as number) || 1,
        primaryBadge: undefined, // Will be populated separately if needed
      },
      parentCommentId: data.parent_comment_id as string | undefined,
      depth: 0, // Will be calculated for nested comments
      path: [], // Will be populated for nested comments
      content: data.content as string,
      isEdited: data.is_edited as boolean,
      editedAt: data.edited_at as string | undefined,
      isDeleted: data.is_deleted as boolean,
      deletedAt: data.deleted_at as string | undefined,
      deletedReason: data.deleted_reason as
        | "self"
        | "moderator"
        | "system"
        | undefined,
      replyCount: data.reply_count as number,
      likeCount: data.like_count as number,
      reactionCounts: defaultReactionCounts,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapToUserCommentStats(
    data: Record<string, unknown>,
  ): UserCommentStats {
    return {
      profileId: data.profile_id as string,
      totalComments: data.total_comments as number,
      totalReplies: data.total_replies as number,
      totalReceivedReplies: data.total_received_replies as number,
      totalLikesReceived: data.total_likes_received as number,
      totalLikesGiven: data.total_likes_given as number,
      totalHelpfulReceived: data.total_helpful_received as number,
      avgReplyDepth: parseFloat(data.avg_reply_depth as string) || 0,
      helpfulComments: data.helpful_comments as number,
      currentCommentStreak: data.current_comment_streak as number,
      longestCommentStreak: data.longest_comment_streak as number,
      lastCommentDate: data.last_comment_date as string | undefined,
      updatedAt: data.updated_at as string,
    };
  }

  private mapToLeaderboardEntry(
    data: Record<string, unknown>,
    rank: number,
  ): CommentLeaderboardEntry {
    return {
      profileId: data.profile_id as string,
      displayName: data.display_name as string,
      avatarUrl: data.avatar_url as string | undefined,
      level: (data.level as number) || 1,
      commentsCount: data.comments_count as number,
      likesReceived: data.likes_received as number,
      repliesReceived: data.replies_received as number,
      rank,
    };
  }

  private async fetchReactionsForComments(
    commentIds: string[],
  ): Promise<Map<string, Record<CommentReactionType, number>>> {
    if (commentIds.length === 0) {
      return new Map();
    }

    const { data, error } = await this.supabase
      .from("comment_reaction_counts")
      .select("*")
      .in("comment_id", commentIds);

    if (error) {
      console.error("Error fetching reactions:", error);
      return new Map();
    }

    const reactionMap = new Map<string, Record<CommentReactionType, number>>();

    // Initialize default counts for all comments
    commentIds.forEach((id) => {
      reactionMap.set(id, { ...defaultReactionCounts });
    });

    // Populate actual counts
    (data || []).forEach((row: unknown) => {
      const typedRow = row as {
        comment_id: string;
        reaction_type: CommentReactionType;
        count: number;
      };
      const counts = reactionMap.get(typedRow.comment_id);
      if (counts) {
        counts[typedRow.reaction_type] = typedRow.count;
      }
    });

    return reactionMap;
  }

  private buildCommentTree(
    root: Record<string, unknown>,
    children: Record<string, unknown>[],
  ): Comment {
    const commentMap = new Map<string, Comment>();

    // Map all comments
    const allComments = [root, ...children];
    allComments.forEach((c) => {
      const comment = this.mapToComment(c as Record<string, unknown>);
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // Build parent-child relationships
    const rootComment = commentMap.get(root.id as string)!;

    children.forEach((c) => {
      const comment = commentMap.get(c.id as string)!;
      const parentId = c.parent_comment_id as string;
      const parent = commentMap.get(parentId);

      if (parent) {
        parent.replies!.push(comment);
        comment.depth = parent.depth + 1;
        comment.path = [...parent.path, parent.id];
      }
    });

    return rootComment;
  }

  private encodeCursor(timestamp: string): string {
    return Buffer.from(timestamp).toString("base64");
  }

  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, "base64").toString("ascii");
  }
}
