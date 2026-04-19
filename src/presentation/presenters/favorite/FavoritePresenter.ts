/**
 * FavoritePresenter
 * Handles business logic for favorite operations
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type {
  FavoriteQueryResult,
  IFavoriteRepository,
} from "@/application/repositories/IFavoriteRepository";
import type {
  IPetPostRepository,
  PaginationMode,
} from "@/application/repositories/IPetPostRepository";
import type { PetPost } from "@/domain/entities/pet-post";

export interface FavoriteIdsResult {
  success: boolean;
  data?: FavoriteQueryResult;
  error?: string;
}

export interface FavoritePostsResult {
  success: boolean;
  postIds?: string[];
  posts?: PetPost[];
  error?: string;
}

export interface CheckFavoriteResult {
  success: boolean;
  isFavorited?: boolean;
  error?: string;
}

export interface ToggleFavoriteResult {
  success: boolean;
  isFavorited?: boolean;
  error?: string;
}

/**
 * Presenter for favorite operations
 * ✅ Receives repositories via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class FavoritePresenter {
  constructor(
    private readonly favoriteRepo: IFavoriteRepository,
    private readonly petPostRepo: IPetPostRepository,
  ) {}

  // ============================================================
  // QUERY METHODS (For API Routes)
  // ============================================================

  /**
   * Get favorite post IDs only
   * Used by /api/favorites GET route (without expand)
   */
  async getFavoritePostIds(
    pagination?: PaginationMode,
  ): Promise<FavoriteIdsResult> {
    try {
      const result = await this.favoriteRepo.getFavoritePostIds(pagination);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error getting favorite post IDs:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get favorite posts";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get favorite posts with full details
   * Used by /api/favorites GET route (with expand=posts)
   */
  async getFavoritePosts(
    pagination?: PaginationMode,
  ): Promise<FavoritePostsResult> {
    try {
      const result = await this.favoriteRepo.getFavoritePostIds(pagination);
      const postIds = result.postIds;

      if (postIds.length === 0) {
        return { success: true, postIds: [], posts: [] };
      }

      // Fetch full post details for each favorite
      const results = await Promise.all(
        postIds.map((id) => this.petPostRepo.getById(id)),
      );
      const posts = results.filter((p): p is PetPost => p !== null);

      return { success: true, postIds, posts };
    } catch (error) {
      console.error("Error getting favorite posts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get favorite posts";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if a post is favorited
   * Used by /api/favorites POST route with action=check
   */
  async checkFavorite(petPostId: string): Promise<CheckFavoriteResult> {
    try {
      const isFavorited = await this.favoriteRepo.isFavorited(petPostId);
      return { success: true, isFavorited };
    } catch (error) {
      console.error("Error checking favorite status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to check favorite status";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // WRITE METHODS (For API Routes)
  // ============================================================

  /**
   * Toggle favorite status for a post
   * Used by /api/favorites POST route (default action)
   */
  async toggleFavorite(petPostId: string): Promise<ToggleFavoriteResult> {
    try {
      const isFavorited = await this.favoriteRepo.toggleFavorite(petPostId);
      return { success: true, isFavorited };
    } catch (error) {
      console.error("Error toggling favorite:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to toggle favorite";
      return { success: false, error: errorMessage };
    }
  }
}
