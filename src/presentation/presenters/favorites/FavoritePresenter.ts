/**
 * FavoritePresenter
 * Handles business logic for favorites
 * Receives repository via dependency injection
 */

import type { IFavoriteRepository } from "@/application/repositories/IFavoriteRepository";
import type { PetPost } from "@/domain/entities/pet-post";
import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";

// ============================================================
// VIEW MODEL
// ============================================================

export interface FavoriteViewModel {
  favoriteIds: string[];
  posts: PetPost[];
  isFavoritedMap: Record<string, boolean>;
}

// ============================================================
// PRESENTER
// ============================================================

export class FavoritePresenter {
  constructor(
    private readonly favoriteRepository: IFavoriteRepository,
    private readonly petPostRepository: IPetPostRepository,
  ) {}

  // ── View Model ───────────────────────────────────────────

  async getViewModel(): Promise<FavoriteViewModel> {
    try {
      const favoriteIds = await this.favoriteRepository.getFavoritePostIds();

      if (favoriteIds.length === 0) {
        return {
          favoriteIds: [],
          posts: [],
          isFavoritedMap: {},
        };
      }

      // Fetch full posts
      const posts = await Promise.all(
        favoriteIds.map((id) => this.petPostRepository.getById(id)),
      );

      const validPosts = posts.filter((p): p is PetPost => p !== null);
      const isFavoritedMap = validPosts.reduce(
        (acc, post) => {
          acc[post.id] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      return {
        favoriteIds,
        posts: validPosts,
        isFavoritedMap,
      };
    } catch (error) {
      console.error("Error getting favorite view model:", error);
      throw error;
    }
  }

  // ── Granular Methods ───────────────────────────────────

  async checkIsFavorited(petPostId: string): Promise<boolean> {
    try {
      return await this.favoriteRepository.isFavorited(petPostId);
    } catch (error) {
      console.error("Error checking favorite status:", error);
      throw error;
    }
  }

  async toggleFavorite(petPostId: string): Promise<boolean> {
    try {
      return await this.favoriteRepository.toggleFavorite(petPostId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }

  async getFavoritePostIds(): Promise<string[]> {
    try {
      return await this.favoriteRepository.getFavoritePostIds();
    } catch (error) {
      console.error("Error getting favorite IDs:", error);
      throw error;
    }
  }
}
