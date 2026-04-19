import type { IFavoriteRepository } from "@/application/repositories/IFavoriteRepository";

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

  async getFavoritePostIds(): Promise<string[]> {
    const profileId = this.getCurrentProfileId();
    const userFavorites = this.favorites.get(profileId) || new Set();
    return Array.from(userFavorites);
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
