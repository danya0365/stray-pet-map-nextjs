/**
 * SupabaseCommentRepository
 * Supabase implementation of ICommentRepository
 * Following Clean Architecture - Infrastructure layer
 */

import type {
  CommentListOptions,
  CommentReplyOptions,
  ICommentRepository,
} from "@/application/repositories/ICommentRepository";
import type {
  Comment,
  CommentGamificationInfo,
  CommentReactionType,
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
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Types from Supabase schema
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
type UserCommentStatsRow =
  Database["public"]["Tables"]["user_comment_stats"]["Row"];
type CommentLeaderboardRow =
  Database["public"]["Views"]["comment_leaderboard_alltime"]["Row"];
type CommentReactionCountRow =
  Database["public"]["Views"]["comment_reaction_counts"]["Row"];

// Profile data from joined query (profiles table uses full_name not display_name)
type ProfileJoinData = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  level: number;
};

// Comment with joined profile data
type CommentWithProfile = CommentRow & {
  profiles?: ProfileJoinData | null;
};

export class SupabaseCommentRepository implements ICommentRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

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
        profiles:profile_id (id, full_name, avatar_url, level)
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
        profiles:profile_id (id, full_name, avatar_url, level)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToComment(data);
  }

  async findByPetPostId(
    petPostId: string,
    options: CommentListOptions,
  ): Promise<CommentThread> {
    const { pagination, sortBy = "newest" } = options;

    let query = this.supabase
      .from("comments")
      .select(
        `
        *,
        profiles:profile_id (id, full_name, avatar_url, level)
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

    let comments: CommentWithProfile[] = [];
    let hasMore = false;
    let nextCursor: string | undefined;
    let total = 0;

    // Handle pagination based on type
    if (pagination.type === "offset") {
      // Offset pagination (for admin)
      const offset = (pagination.page - 1) * pagination.perPage;
      query = query.range(offset, offset + pagination.perPage - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching comments:", error);
        throw new Error(`Failed to fetch comments: ${error.message}`);
      }

      comments = data || [];
      total = count || 0;
      hasMore = offset + comments.length < total;
    } else {
      // Cursor pagination (for frontend load more)
      const limit = pagination.limit ?? COMMENT_CONSTRAINTS.PAGE_SIZE.TOP_LEVEL;

      if (pagination.cursor) {
        const decodedCursor = this.decodeCursor(pagination.cursor);
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

      comments = (data || []).slice(0, limit);
      hasMore = (data || []).length > limit;
      nextCursor =
        hasMore && comments.length > 0
          ? this.encodeCursor(comments[comments.length - 1].created_at)
          : undefined;
      total = count || 0;
    }

    // Fetch reactions for these comments
    const commentIds = comments.map((c) => c.id);
    const reactions = await this.fetchReactionsForComments(commentIds);

    // Fetch user interactions if viewerProfileId provided
    const viewerProfileId = options.viewerProfileId;
    const userInteractions = viewerProfileId
      ? await this.fetchUserInteractionsForComments(commentIds, viewerProfileId)
      : new Map();

    // Map comments with author info, reactions, and user interactions
    const mappedComments = comments.map((c) => {
      const interaction = userInteractions.get(c.id);
      const comment = this.mapToComment(c, interaction);
      comment.reactionCounts =
        reactions.get(comment.id) || defaultReactionCounts;
      return comment;
    });

    return {
      petPostId,
      totalComments: total,
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
        profiles:profile_id (id, full_name, avatar_url, level)
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
    options: CommentReplyOptions,
  ): Promise<{ replies: Comment[]; hasMore: boolean; nextCursor?: string }> {
    const { pagination } = options;

    let query = this.supabase
      .from("comments")
      .select(
        `
        *,
        profiles:profile_id (id, full_name, avatar_url, level)
      `,
      )
      .eq("parent_comment_id", parentCommentId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    let comments: CommentWithProfile[] = [];
    let hasMore = false;
    let nextCursor: string | undefined;

    if (pagination.type === "offset") {
      // Offset pagination (for admin)
      const offset = (pagination.page - 1) * pagination.perPage;
      query = query.range(offset, offset + pagination.perPage - 1);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching replies:", error);
        throw new Error(`Failed to fetch replies: ${error.message}`);
      }

      comments = data || [];
    } else {
      // Cursor pagination (for frontend load more)
      const limit = pagination.limit ?? COMMENT_CONSTRAINTS.PAGE_SIZE.REPLIES;

      if (pagination.cursor) {
        query = query.gt("created_at", this.decodeCursor(pagination.cursor));
      }

      query = query.limit(limit + 1); // Fetch one extra to check hasMore

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching replies:", error);
        throw new Error(`Failed to fetch replies: ${error.message}`);
      }

      comments = (data || []).slice(0, limit);
      hasMore = (data || []).length > limit;
      nextCursor =
        hasMore && comments.length > 0
          ? this.encodeCursor(comments[comments.length - 1].created_at)
          : undefined;
    }

    // Fetch reactions for these replies
    const commentIds = comments.map((c) => c.id);
    const reactions = await this.fetchReactionsForComments(commentIds);

    // Fetch user interactions if viewerProfileId provided
    const viewerProfileId = options.viewerProfileId;
    const userInteractions = viewerProfileId
      ? await this.fetchUserInteractionsForComments(commentIds, viewerProfileId)
      : new Map();

    return {
      replies: comments.map((c) => {
        const interaction = userInteractions.get(c.id);
        const comment = this.mapToComment(c, interaction);
        comment.reactionCounts =
          reactions.get(comment.id) || defaultReactionCounts;
        return comment;
      }),
      hasMore,
      nextCursor,
    };
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
        profiles:profile_id (id, full_name, avatar_url, level)
      `,
      )
      .eq("id", commentId)
      .single();

    if (rootError || !rootComment) return null;

    // Build tree using recursive query via RPC
    const { data: treeData, error: treeError } = await this.supabase.rpc(
      "get_comment_thread",
      { p_pet_post_id: commentId, p_max_depth: maxDepth },
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

    return (data || []).map((entry, index) =>
      this.mapToLeaderboardEntry(entry as CommentLeaderboardRow, index + 1),
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
    const relevantLogs = (logData || []).filter((log) => log.action === action);
    const pointsEarned = relevantLogs.reduce(
      (sum, log) => sum + log.points_awarded,
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
      p_comment_id: commentId,
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

  private mapToComment(
    data: CommentWithProfile,
    userInteraction?: {
      hasLiked: boolean;
      reaction: CommentReactionType | null;
    },
  ): Comment {
    const profile = data.profiles;

    return {
      id: data.id,
      petPostId: data.pet_post_id,
      profileId: data.profile_id,
      author: {
        profileId: profile?.id ?? data.profile_id,
        displayName: profile?.full_name ?? "ผู้ใช้",
        avatarUrl: profile?.avatar_url ?? undefined,
        level: profile?.level ?? 1,
        primaryBadge: undefined, // Will be populated separately if needed
      },
      parentCommentId: data.parent_comment_id ?? undefined,
      depth: 0, // Will be calculated for nested comments
      path: [], // Will be populated for nested comments
      content: data.content,
      isEdited: data.is_edited,
      editedAt: data.edited_at ?? undefined,
      isDeleted: data.is_deleted,
      deletedAt: data.deleted_at ?? undefined,
      deletedReason:
        (data.deleted_reason as "self" | "moderator" | "system" | undefined) ??
        undefined,
      replyCount: data.reply_count,
      likeCount: data.like_count,
      reactionCounts: defaultReactionCounts,
      userHasLiked: userInteraction?.hasLiked ?? false,
      userReaction: userInteraction?.reaction ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToUserCommentStats(data: UserCommentStatsRow): UserCommentStats {
    return {
      profileId: data.profile_id,
      totalComments: data.total_comments,
      totalReplies: data.total_replies,
      totalReceivedReplies: data.total_received_replies,
      totalLikesReceived: data.total_likes_received,
      totalLikesGiven: data.total_likes_given,
      totalHelpfulReceived: data.total_helpful_received,
      avgReplyDepth: data.avg_reply_depth,
      helpfulComments: data.helpful_comments,
      currentCommentStreak: data.current_comment_streak,
      longestCommentStreak: data.longest_comment_streak,
      lastCommentDate: data.last_comment_date ?? undefined,
      updatedAt: data.updated_at,
    };
  }

  private mapToLeaderboardEntry(
    data: CommentLeaderboardRow,
    rank: number,
  ): CommentLeaderboardEntry {
    return {
      profileId: data.profile_id!,
      displayName: data.full_name ?? "ผู้ใช้",
      avatarUrl: data.avatar_url ?? undefined,
      level: data.profile_level ?? 1,
      commentsCount: data.comments_count ?? 0,
      likesReceived: data.likes_received ?? 0,
      repliesReceived: data.replies_received ?? 0,
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
    (data || []).forEach((row) => {
      const typedRow = row as CommentReactionCountRow;
      const counts = reactionMap.get(typedRow.comment_id!);
      if (counts && typedRow.reaction_type) {
        counts[typedRow.reaction_type] = typedRow.count ?? 0;
      }
    });

    return reactionMap;
  }

  private async fetchUserInteractionsForComments(
    commentIds: string[],
    profileId: string,
  ): Promise<
    Map<string, { hasLiked: boolean; reaction: CommentReactionType | null }>
  > {
    if (commentIds.length === 0) {
      return new Map();
    }

    // Batch fetch likes and reactions in parallel
    const [
      { data: likesData, error: likesError },
      { data: reactionsData, error: reactionsError },
    ] = await Promise.all([
      this.supabase
        .from("comment_likes")
        .select("comment_id")
        .in("comment_id", commentIds)
        .eq("profile_id", profileId),
      this.supabase
        .from("comment_reactions")
        .select("comment_id, reaction_type")
        .in("comment_id", commentIds)
        .eq("profile_id", profileId),
    ]);

    if (likesError) {
      console.error("Error fetching user likes:", likesError);
    }
    if (reactionsError) {
      console.error("Error fetching user reactions:", reactionsError);
    }

    const interactionMap = new Map<
      string,
      { hasLiked: boolean; reaction: CommentReactionType | null }
    >();

    // Initialize all as no interaction
    commentIds.forEach((id) => {
      interactionMap.set(id, { hasLiked: false, reaction: null });
    });

    // Populate likes
    (likesData || []).forEach((row) => {
      const interaction = interactionMap.get(row.comment_id);
      if (interaction) {
        interaction.hasLiked = true;
      }
    });

    // Populate reactions
    (reactionsData || []).forEach((row) => {
      const interaction = interactionMap.get(row.comment_id);
      if (interaction && row.reaction_type) {
        interaction.reaction = row.reaction_type as CommentReactionType;
      }
    });

    return interactionMap;
  }

  private buildCommentTree(
    root: CommentWithProfile,
    children: CommentWithProfile[],
  ): Comment {
    const commentMap = new Map<string, Comment>();

    // Map all comments
    const allComments = [root, ...children];
    allComments.forEach((c) => {
      const comment = this.mapToComment(c);
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // Build parent-child relationships
    const rootComment = commentMap.get(root.id)!;

    children.forEach((c) => {
      const comment = commentMap.get(c.id)!;
      const parentId = c.parent_comment_id;
      if (!parentId) return;

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
