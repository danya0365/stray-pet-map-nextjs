/**
 * FavoritePresenter
 * Handles business logic for favorites
 * Receives repository via dependency injection
 */

import type { IFavoriteRepository } from "@/application/repositories/IFavoriteRepository";
import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import type { PetPost } from "@/domain/entities/pet-post";

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
      const favoriteResult = await this.favoriteRepository.getFavoritePostIds();

      if (favoriteResult.postIds.length === 0) {
        return {
          favoriteIds: [],
          posts: [],
          isFavoritedMap: {},
        };
      }

      // Fetch full posts
      const posts = await Promise.all(
        favoriteResult.postIds.map((id) => this.petPostRepository.getById(id)),
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
        favoriteIds: favoriteResult.postIds,
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
      // ถ้า user ไม่ได้ login หรือเกิด error อื่นๆ
      // ให้ return false แทนการ throw error (เพราะ user ไม่ login = ไม่มีรายการโปรด)
      console.log("Favorite check failed, returning false:", error);
      return false;
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
      const result = await this.favoriteRepository.getFavoritePostIds();
      return result.postIds;
    } catch (error) {
      console.error("Error getting favorite IDs:", error);
      throw error;
    }
  }
}
