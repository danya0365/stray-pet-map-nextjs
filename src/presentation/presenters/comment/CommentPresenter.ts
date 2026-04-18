/**
 * CommentPresenter
 * Presentation layer for comment operations following Clean Architecture
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
import { COMMENT_CONSTRAINTS, COMMENT_POINTS } from "@/domain/entities/comment";
import type {
  CommentLeaderboardEntry,
  CommentLeaderboardPeriod,
  UserCommentStats,
} from "@/domain/entities/comment-stats";

export interface CommentPresenterResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export class CommentPresenter {
  constructor(private repository: ICommentRepository) {}

  // ============================================================================
  // Core Comment Operations
  // ============================================================================

  async createComment(
    data: CreateCommentData,
    profileId: string,
  ): Promise<
    CommentPresenterResult<{
      comment: Comment;
      gamification: CommentGamificationInfo;
    }>
  > {
    try {
      // Validate content length
      if (data.content.length < COMMENT_CONSTRAINTS.MIN_LENGTH) {
        return { success: false, error: "Comment is too short" };
      }
      if (data.content.length > COMMENT_CONSTRAINTS.MAX_LENGTH) {
        return {
          success: false,
          error: "Comment is too long (max 2000 characters)",
        };
      }

      // Check depth limit if replying
      if (data.parentCommentId) {
        const depth = await this.repository.getCommentDepth(
          data.parentCommentId,
        );
        if (depth >= COMMENT_CONSTRAINTS.MAX_DEPTH) {
          return { success: false, error: "Maximum nesting depth reached" };
        }
      }

      // Create comment
      const comment = await this.repository.create(data, profileId);

      // Get gamification info
      const action = data.parentCommentId ? "reply_created" : "comment_created";
      const gamification = await this.repository.getGamificationInfo(
        profileId,
        action,
      );

      return {
        success: true,
        data: { comment, gamification },
      };
    } catch (error) {
      console.error("Error creating comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create comment",
      };
    }
  }

  async getThread(
    petPostId: string,
    options: CommentListOptions = {},
  ): Promise<CommentPresenterResult<CommentThread>> {
    try {
      const thread = await this.repository.findByPetPostId(petPostId, options);
      return { success: true, data: thread };
    } catch (error) {
      console.error("Error fetching thread:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch comments",
      };
    }
  }

  async getComment(
    commentId: string,
    depth = 3,
  ): Promise<CommentPresenterResult<Comment>> {
    try {
      const comment = await this.repository.getThreadTree(commentId, depth);
      if (!comment) {
        return { success: false, error: "Comment not found" };
      }
      return { success: true, data: comment };
    } catch (error) {
      console.error("Error fetching comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch comment",
      };
    }
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentData,
    profileId: string,
  ): Promise<CommentPresenterResult<Comment>> {
    try {
      // Validate content length
      if (data.content.length < COMMENT_CONSTRAINTS.MIN_LENGTH) {
        return { success: false, error: "Comment is too short" };
      }
      if (data.content.length > COMMENT_CONSTRAINTS.MAX_LENGTH) {
        return {
          success: false,
          error: "Comment is too long (max 2000 characters)",
        };
      }

      const comment = await this.repository.update(commentId, data, profileId);
      return { success: true, data: comment };
    } catch (error) {
      console.error("Error updating comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update comment",
      };
    }
  }

  async deleteComment(
    commentId: string,
    profileId: string,
  ): Promise<CommentPresenterResult<void>> {
    try {
      await this.repository.softDelete(commentId, profileId, "self");
      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete comment",
      };
    }
  }

  // ============================================================================
  // Reply Operations
  // ============================================================================

  async getReplies(
    parentCommentId: string,
    options: CommentReplyOptions = {},
  ): Promise<CommentPresenterResult<Comment[]>> {
    try {
      const replies = await this.repository.findReplies(
        parentCommentId,
        options,
      );
      return { success: true, data: replies };
    } catch (error) {
      console.error("Error fetching replies:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch replies",
      };
    }
  }

  // ============================================================================
  // Engagement Operations
  // ============================================================================

  async toggleLike(
    commentId: string,
    profileId: string,
  ): Promise<CommentPresenterResult<{ liked: boolean }>> {
    try {
      const hasLiked = await this.repository.hasLiked(commentId, profileId);

      if (hasLiked) {
        await this.repository.removeLike(commentId, profileId);
        return { success: true, data: { liked: false } };
      } else {
        await this.repository.addLike(commentId, profileId);
        return { success: true, data: { liked: true } };
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to toggle like",
      };
    }
  }

  async addReaction(
    commentId: string,
    profileId: string,
    type: CommentReactionType,
  ): Promise<CommentPresenterResult<{ reaction: CommentReactionType }>> {
    try {
      await this.repository.addReaction(commentId, profileId, type);
      return { success: true, data: { reaction: type } };
    } catch (error) {
      console.error("Error adding reaction:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to add reaction",
      };
    }
  }

  async removeReaction(
    commentId: string,
    profileId: string,
  ): Promise<CommentPresenterResult<void>> {
    try {
      await this.repository.removeReaction(commentId, profileId);
      return { success: true };
    } catch (error) {
      console.error("Error removing reaction:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove reaction",
      };
    }
  }

  async getUserInteraction(
    commentId: string,
    profileId: string,
  ): Promise<{ hasLiked: boolean; reaction: CommentReactionType | null }> {
    try {
      const [hasLiked, reaction] = await Promise.all([
        this.repository.hasLiked(commentId, profileId),
        this.repository.getUserReaction(commentId, profileId),
      ]);
      return { hasLiked, reaction };
    } catch (error) {
      console.error("Error getting user interaction:", error);
      return { hasLiked: false, reaction: null };
    }
  }

  // ============================================================================
  // Statistics & Leaderboard
  // ============================================================================

  async getUserStats(
    profileId: string,
  ): Promise<CommentPresenterResult<UserCommentStats>> {
    try {
      const stats = await this.repository.getUserStats(profileId);
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      };
    }
  }

  async getLeaderboard(
    period: CommentLeaderboardPeriod,
    limit = 10,
  ): Promise<CommentPresenterResult<CommentLeaderboardEntry[]>> {
    try {
      const leaderboard = await this.repository.getLeaderboard(period, limit);
      return { success: true, data: leaderboard };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch leaderboard",
      };
    }
  }

  // ============================================================================
  // Gamification Helpers
  // ============================================================================

  calculatePointsForStreak(streakDays: number): number {
    if (streakDays >= 100) return COMMENT_POINTS.STREAK_BONUS[100];
    if (streakDays >= 60) return COMMENT_POINTS.STREAK_BONUS[60];
    if (streakDays >= 30) return COMMENT_POINTS.STREAK_BONUS[30];
    if (streakDays >= 14) return COMMENT_POINTS.STREAK_BONUS[14];
    if (streakDays >= 7) return COMMENT_POINTS.STREAK_BONUS[7];
    if (streakDays >= 3) return COMMENT_POINTS.STREAK_BONUS[3];
    return 0;
  }

  getEngagementMessage(gamification: CommentGamificationInfo): string {
    if (gamification.badgeUnlocked) {
      return `🏅 ปลดล็อก Badge: ${gamification.badgeUnlocked.name}!`;
    }
    if (gamification.streakBonus && gamification.streakBonus > 0) {
      return `🔥 Streak Bonus: +${gamification.streakBonus} คะแนน!`;
    }
    if (gamification.pointsEarned > 0) {
      return `+${gamification.pointsEarned} คะแนน`;
    }
    return "";
  }
}
