/**
 * PetPostPresenter
 * Handles business logic for pet post operations
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type {
  IPetPostRepository,
  PetPostFilters,
  PetPostQuery,
  PetPostQueryResult,
} from "@/application/repositories/IPetPostRepository";
import type {
  CreatePetPostPayload,
  PetPost,
  PetPostOutcome,
  PetPostStats,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";

export interface QueryResult {
  success: boolean;
  data?: PetPostQueryResult;
  error?: string;
}

export interface SinglePostResult {
  success: boolean;
  data?: PetPost;
  error?: string;
}

export interface CreateResult {
  success: boolean;
  data?: PetPost;
  error?: string;
}

export interface UpdateResult {
  success: boolean;
  data?: PetPost;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface StatsResult {
  success: boolean;
  data?: PetPostStats;
  error?: string;
}

export interface SuccessStoriesResult {
  success: boolean;
  data?: PetPost[];
  error?: string;
}

export interface CloseResult {
  success: boolean;
  data?: PetPost;
  error?: string;
}

export interface ArchivePreviewResult {
  success: boolean;
  willExpire?: { id: string; createdAt: string }[];
  willWarn?: { id: string; title: string; createdAt: string; purpose: string }[];
  expireCount?: number;
  warnCount?: number;
  error?: string;
}

export interface ArchiveResult {
  success: boolean;
  archived?: number;
  failed?: number;
  postIds?: string[];
  failedIds?: string[];
  error?: string;
}

/**
 * Presenter for pet post operations
 * ✅ Receives repository via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class PetPostPresenter {
  constructor(private readonly repository: IPetPostRepository) {}

  // ============================================================
  // QUERY METHODS (For API Routes)
  // ============================================================

  /**
   * Query pet posts with filters and pagination
   * Used by /api/pet-posts GET route
   */
  async query(params: PetPostQuery): Promise<QueryResult> {
    try {
      const result = await this.repository.query(params);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error querying pet posts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to query pet posts";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get single pet post by ID
   * Used by /api/pet-posts/[id] GET route
   */
  async getById(id: string): Promise<SinglePostResult> {
    try {
      const post = await this.repository.getById(id);

      if (!post) {
        return { success: false, error: "Post not found" };
      }

      return { success: true, data: post };
    } catch (error) {
      console.error("Error getting pet post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get pet post";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get pet post with owner information
   * Used for detailed view
   */
  async getByIdWithOwner(id: string): Promise<SinglePostResult> {
    try {
      const post = await this.repository.getByIdWithOwner(id);

      if (!post) {
        return { success: false, error: "Post not found" };
      }

      return { success: true, data: post };
    } catch (error) {
      console.error("Error getting pet post with owner:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get pet post";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // WRITE METHODS (For API Routes)
  // ============================================================

  /**
   * Create a new pet post
   * Used by /api/pet-posts POST route
   */
  async create(data: CreatePetPostPayload): Promise<CreateResult> {
    try {
      const post = await this.repository.create(data);
      return { success: true, data: post };
    } catch (error) {
      console.error("Error creating pet post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create pet post";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update an existing pet post
   * Used by /api/pet-posts/[id] PUT route
   */
  async update(
    id: string,
    data: UpdatePetPostData,
  ): Promise<UpdateResult> {
    try {
      const post = await this.repository.update(id, data);
      return { success: true, data: post };
    } catch (error) {
      console.error("Error updating pet post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update pet post";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Delete (soft delete) a pet post
   * Used by /api/pet-posts/[id] DELETE route
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      await this.repository.delete(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting pet post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete pet post";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // STATS METHODS (For API Routes)
  // ============================================================

  /**
   * Get pet post statistics
   * Used by /api/pet-posts/stats GET route
   */
  async getStats(filters?: PetPostFilters): Promise<StatsResult> {
    try {
      const stats = await this.repository.getStats(filters);
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error getting pet post stats:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get stats";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get success stories (completed adoptions)
   * Used by /api/pet-posts/success-stories GET route
   */
  async getSuccessStories(limit = 6): Promise<SuccessStoriesResult> {
    try {
      const stories = await this.repository.getSuccessStories(limit);
      return { success: true, data: stories };
    } catch (error) {
      console.error("Error getting success stories:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get success stories";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // CLOSE/ARCHIVE METHODS (For API Routes)
  // ============================================================

  /**
   * Close a pet post with outcome
   * Used by /api/pet-posts/[id]/close POST route
   */
  async close(id: string, outcome: PetPostOutcome): Promise<CloseResult> {
    try {
      // First verify the post exists
      const existing = await this.repository.getById(id);
      if (!existing) {
        return { success: false, error: "Post not found" };
      }

      const post = await this.repository.close(id, outcome);
      return { success: true, data: post };
    } catch (error) {
      console.error("Error closing pet post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to close pet post";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Preview posts that will be archived
   * Used by /api/pet-posts/auto-archive GET route (dry run)
   */
  async previewAutoArchive(
    expiryDays: number,
    warningDays: number,
  ): Promise<ArchivePreviewResult> {
    try {
      const [willExpire, willWarn] = await Promise.all([
        this.repository.findExpiredPosts(expiryDays),
        this.repository.findExpiringSoonPosts(expiryDays, warningDays),
      ]);

      return {
        success: true,
        willExpire,
        willWarn,
        expireCount: willExpire.length,
        warnCount: willWarn.length,
      };
    } catch (error) {
      console.error("Error previewing auto archive:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to preview archive";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Auto-archive expired posts
   * Used by /api/pet-posts/auto-archive POST route
   */
  async autoArchive(expiryDays: number): Promise<ArchiveResult> {
    try {
      // Get expired posts
      const expiredPosts = await this.repository.findExpiredPosts(expiryDays);

      // Archive each post
      const archivedPosts: string[] = [];
      const failedPosts: string[] = [];

      for (const post of expiredPosts) {
        try {
          await this.repository.update(post.id, {
            outcome: "expired",
            resolvedAt: new Date().toISOString(),
            isArchived: true,
            isActive: false,
          });
          archivedPosts.push(post.id);
        } catch (err) {
          console.error(`Failed to archive post ${post.id}:`, err);
          failedPosts.push(post.id);
        }
      }

      return {
        success: true,
        archived: archivedPosts.length,
        failed: failedPosts.length,
        postIds: archivedPosts,
        failedIds: failedPosts,
      };
    } catch (error) {
      console.error("Error auto-archiving posts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to auto-archive";
      return { success: false, error: errorMessage };
    }
  }
}
