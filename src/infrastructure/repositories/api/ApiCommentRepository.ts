"use client";

import type {
  CommentListOptions,
  CommentReplyOptions,
  CommentReplyResult,
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
import type {
  CommentLeaderboardEntry,
  CommentLeaderboardPeriod,
  UserCommentStats,
} from "@/domain/entities/comment-stats";

/**
 * ApiCommentRepository
 * Implements ICommentRepository using API calls
 * ✅ For use in CLIENT-SIDE components only
 * ✅ Calls go through Next.js API routes
 */
export class ApiCommentRepository implements ICommentRepository {
  private baseUrl = "/api/comments";

  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  async create(data: CreateCommentData, _profileId: string): Promise<Comment> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถสร้างความคิดเห็นได้");
    }

    const result = await res.json();
    return result.comment;
  }

  async findById(id: string): Promise<Comment | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);

    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดความคิดเห็นได้");
    }

    return res.json();
  }

  async findByPetPostId(
    petPostId: string,
    options: CommentListOptions,
  ): Promise<CommentThread> {
    const params = new URLSearchParams({ petPostId });

    // Add pagination params
    if (options.pagination.type === "offset") {
      params.set("paginationType", "offset");
      params.set("page", options.pagination.page.toString());
      params.set("perPage", options.pagination.perPage.toString());
    } else {
      params.set("paginationType", "cursor");
      if (options.pagination.cursor) {
        params.set("cursor", options.pagination.cursor);
      }
      params.set("limit", options.pagination.limit.toString());
    }

    if (options.sortBy) params.set("sortBy", options.sortBy);

    const res = await fetch(`${this.baseUrl}?${params}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดความคิดเห็นได้");
    }

    return res.json();
  }

  async update(
    id: string,
    data: UpdateCommentData,
    _profileId: string,
  ): Promise<Comment> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถแก้ไขความคิดเห็นได้");
    }

    return res.json();
  }

  async softDelete(
    id: string,
    _profileId: string,
    _reason: "self" | "moderator",
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถลบความคิดเห็นได้");
    }
  }

  // ============================================================================
  // Thread Operations
  // ============================================================================

  async findReplies(
    parentCommentId: string,
    options: CommentReplyOptions,
  ): Promise<CommentReplyResult> {
    const params = new URLSearchParams();

    // Add pagination params
    if (options.pagination.type === "offset") {
      params.set("paginationType", "offset");
      params.set("page", options.pagination.page.toString());
      params.set("perPage", options.pagination.perPage.toString());
    } else {
      params.set("paginationType", "cursor");
      if (options.pagination.cursor) {
        params.set("cursor", options.pagination.cursor);
      }
      params.set("limit", options.pagination.limit.toString());
    }

    const res = await fetch(
      `${this.baseUrl}/${parentCommentId}/replies?${params}`,
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดการตอบกลับได้");
    }

    return res.json();
  }

  async getThreadTree(
    commentId: string,
    maxDepth = 5,
  ): Promise<Comment | null> {
    const res = await fetch(`${this.baseUrl}/${commentId}?depth=${maxDepth}`);

    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดความคิดเห็นได้");
    }

    return res.json();
  }

  // ============================================================================
  // Engagement Operations
  // ============================================================================

  async addLike(commentId: string, _profileId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${commentId}/like`, {
      method: "POST",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถถูกใจความคิดเห็นได้");
    }
  }

  async removeLike(commentId: string, _profileId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${commentId}/like`, {
      method: "POST", // toggle like handles both add/remove
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถยกเลิกถูกใจได้");
    }
  }

  async addReaction(
    commentId: string,
    _profileId: string,
    type: CommentReactionType,
  ): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${commentId}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถเพิ่มรีแอคชั่นได้");
    }
  }

  async removeReaction(commentId: string, _profileId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${commentId}/reaction`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถลบรีแอคชั่นได้");
    }
  }

  async hasLiked(_commentId: string, _profileId: string): Promise<boolean> {
    // Not needed for client - user state comes with comments
    return false;
  }

  async getUserReaction(
    _commentId: string,
    _profileId: string,
  ): Promise<CommentReactionType | null> {
    // Not needed for client - user state comes with comments
    return null;
  }

  // ============================================================================
  // Statistics & Gamification
  // ============================================================================

  async getUserStats(_profileId: string): Promise<UserCommentStats> {
    // TODO: Implement if needed
    throw new Error("Not implemented");
  }

  async getLeaderboard(
    _period: CommentLeaderboardPeriod,
    _limit = 10,
  ): Promise<CommentLeaderboardEntry[]> {
    // TODO: Implement if needed
    throw new Error("Not implemented");
  }

  async getGamificationInfo(
    _profileId: string,
    _action: "comment_created" | "reply_created",
  ): Promise<CommentGamificationInfo> {
    // Gamification info comes with create response
    return { pointsEarned: 0 };
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async countByPetPostId(petPostId: string): Promise<number> {
    const thread = await this.findByPetPostId(petPostId, {
      pagination: { type: "cursor", limit: 1 },
    });
    return thread.totalComments || 0;
  }

  async exists(id: string): Promise<boolean> {
    const comment = await this.findById(id);
    return comment !== null;
  }

  async getCommentDepth(_commentId: string): Promise<number> {
    // Not needed for client
    return 0;
  }
}
