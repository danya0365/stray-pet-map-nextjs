/**
 * PetPostLikePresenter
 * Handles business logic for pet post likes
 * Receives repository via dependency injection
 */

import type { IPetPostLikeRepository } from "@/application/repositories/IPetPostLikeRepository";

// ============================================================
// VIEW MODEL
// ============================================================

export interface PetPostLikeViewModel {
  isLiked: boolean;
  likeCount: number;
}

// ============================================================
// PRESENTER RESULT
// ============================================================

export interface PetPostLikePresenterResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// ============================================================
// PRESENTER
// ============================================================

export class PetPostLikePresenter {
  constructor(private readonly repository: IPetPostLikeRepository) {}

  async getLikeStatus(
    petPostId: string,
  ): Promise<PetPostLikePresenterResult<PetPostLikeViewModel>> {
    try {
      const [isLiked, likeCount] = await Promise.all([
        this.repository.isLiked(petPostId),
        this.repository.getLikeCount(petPostId),
      ]);

      return {
        success: true,
        data: { isLiked, likeCount },
      };
    } catch (error) {
      console.error("Error getting like status:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get like status",
      };
    }
  }

  async toggleLike(
    petPostId: string,
  ): Promise<PetPostLikePresenterResult<{ isLiked: boolean }>> {
    try {
      const isLiked = await this.repository.toggleLike(petPostId);
      return {
        success: true,
        data: { isLiked },
      };
    } catch (error) {
      console.error("Error toggling like:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to toggle like",
      };
    }
  }
}
