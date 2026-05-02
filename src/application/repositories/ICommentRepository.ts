import type {
  Comment,
  CommentGamificationInfo,
  CommentReactionType,
  CommentThread,
  CreateCommentData,
  UpdateCommentData,
} from "@/domain/entities/comment";
import type {
  CommentLeaderboardEntry,
  CommentLeaderboardPeriod,
  UserCommentStats,
} from "@/domain/entities/comment-stats";
import type { PaginationMode } from "@/domain/types/pagination";

// ============================================================================
// QUERY OPTIONS
// ============================================================================

export interface CommentListBaseOptions {
  depth?: number;
  sortBy?: "newest" | "oldest" | "popular";
  viewerProfileId?: string; // For fetching user-specific interaction state
}

export type CommentListOptions = CommentListBaseOptions & {
  pagination: PaginationMode;
};

export type CommentReplyOptions = {
  pagination: PaginationMode;
  viewerProfileId?: string; // For fetching user-specific interaction state
};

export interface CommentReplyResult {
  replies: Comment[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * ICommentRepository
 * Repository interface for comment operations following Clean Architecture
 */
export interface ICommentRepository {
  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  /**
   * Create a new comment
   * @returns Created comment with author info
   */
  create(data: CreateCommentData, profileId: string): Promise<Comment>;

  /**
   * Find a single comment by ID
   * @returns Comment with author info, or null if not found
   */
  findById(id: string): Promise<Comment | null>;

  /**
   * Find comments for a pet post
   * @returns Thread with top-level comments and pagination info
   */
  findByPetPostId(
    petPostId: string,
    options: CommentListOptions,
  ): Promise<CommentThread>;

  /**
   * Update comment content
   * @throws Error if comment not found or user not authorized
   */
  update(
    id: string,
    data: UpdateCommentData,
    profileId: string,
  ): Promise<Comment>;

  /**
   * Soft delete a comment
   * Preserves thread structure but marks as deleted
   * @throws Error if comment not found or user not authorized
   */
  softDelete(
    id: string,
    profileId: string,
    reason: "self" | "moderator",
  ): Promise<void>;

  // ============================================================================
  // Thread Operations
  // ============================================================================

  /**
   * Find replies to a specific comment
   * @returns Paginated list of reply comments with pagination info
   */
  findReplies(
    parentCommentId: string,
    options: CommentReplyOptions,
  ): Promise<CommentReplyResult>;

  /**
   * Get the full thread tree for a comment (all nested replies)
   * @returns Comment with recursively populated replies
   */
  getThreadTree(commentId: string, maxDepth?: number): Promise<Comment | null>;

  // ============================================================================
  // Engagement Operations
  // ============================================================================

  /**
   * Add a like to a comment
   * Idempotent - safe to call multiple times
   */
  addLike(commentId: string, profileId: string): Promise<void>;

  /**
   * Remove a like from a comment
   */
  removeLike(commentId: string, profileId: string): Promise<void>;

  /**
   * Add or update a reaction to a comment
   * Replaces any existing reaction by this user
   */
  addReaction(
    commentId: string,
    profileId: string,
    type: CommentReactionType,
  ): Promise<void>;

  /**
   * Remove a reaction from a comment
   */
  removeReaction(commentId: string, profileId: string): Promise<void>;

  /**
   * Check if user has liked a comment
   */
  hasLiked(commentId: string, profileId: string): Promise<boolean>;

  /**
   * Get user's reaction to a comment
   * @returns Reaction type or null if no reaction
   */
  getUserReaction(
    commentId: string,
    profileId: string,
  ): Promise<CommentReactionType | null>;

  // ============================================================================
  // Statistics & Gamification
  // ============================================================================

  /**
   * Get user's comment statistics
   */
  getUserStats(profileId: string): Promise<UserCommentStats>;

  /**
   * Get comment leaderboard
   * @param period - Time period for leaderboard
   * @param limit - Maximum number of entries (default 10)
   */
  getLeaderboard(
    period: CommentLeaderboardPeriod,
    limit?: number,
  ): Promise<CommentLeaderboardEntry[]>;

  /**
   * Get gamification info for a comment action
   * Used after creating comments to show points earned
   */
  getGamificationInfo(
    profileId: string,
    action: "comment_created" | "reply_created",
  ): Promise<CommentGamificationInfo>;

  // ============================================================================
  // Utility Operations
  // ============================================================================

  /**
   * Count total comments for a pet post
   */
  countByPetPostId(petPostId: string): Promise<number>;

  /**
   * Check if a comment exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get the depth of a comment in the thread
   */
  getCommentDepth(commentId: string): Promise<number>;
}
