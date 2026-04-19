import type {
  FavoriteQueryResult,
  IFavoriteRepository,
} from "@/application/repositories/IFavoriteRepository";
import type { PaginationMode } from "@/application/repositories/IPetPostRepository";

export class MockFavoriteRepository implements IFavoriteRepository {
  private favorites: Map<string, Set<string>> = new Map(); // profileId -> Set of petPostIds

  constructor() {
    // Initialize with empty favorites for demo
  }

  private getCurrentProfileId(): string {
    // In mock mode, assume a default profile
    return "mock-profile-001";
  }

  async isFavorited(petPostId: string): Promise<boolean> {
    const profileId = this.getCurrentProfileId();
    const userFavorites = this.favorites.get(profileId) || new Set();
    return userFavorites.has(petPostId);
  }

  async getFavoritePostIds(
    pagination?: PaginationMode,
  ): Promise<FavoriteQueryResult> {
    const profileId = this.getCurrentProfileId();
    const userFavorites = this.favorites.get(profileId) || new Set();
    const allPostIds = Array.from(userFavorites);

    // Simple mock pagination
    if (pagination?.type === "offset") {
      const { page, perPage } = pagination;
      const offset = (page - 1) * perPage;
      const paginatedIds = allPostIds.slice(offset, offset + perPage);
      const hasMore = offset + paginatedIds.length < allPostIds.length;

      return {
        postIds: paginatedIds,
        total: allPostIds.length,
        hasMore,
        page,
        perPage,
      };
    } else if (pagination?.type === "cursor") {
      // Mock cursor pagination - just return all for simplicity
      return {
        postIds: allPostIds,
        total: allPostIds.length,
        hasMore: false,
        nextCursor: null,
      };
    }

    // No pagination - return all
    return {
      postIds: allPostIds,
      total: allPostIds.length,
      hasMore: false,
    };
  }

  async addFavorite(petPostId: string): Promise<void> {
    const profileId = this.getCurrentProfileId();
    if (!this.favorites.has(profileId)) {
      this.favorites.set(profileId, new Set());
    }
    this.favorites.get(profileId)!.add(petPostId);
  }

  async removeFavorite(petPostId: string): Promise<void> {
    const profileId = this.getCurrentProfileId();
    const userFavorites = this.favorites.get(profileId);
    if (userFavorites) {
      userFavorites.delete(petPostId);
    }
  }

  async toggleFavorite(petPostId: string): Promise<boolean> {
    const isFav = await this.isFavorited(petPostId);
    if (isFav) {
      await this.removeFavorite(petPostId);
      return false;
    } else {
      await this.addFavorite(petPostId);
      return true;
    }
  }
}
