export interface IFavoriteRepository {
  isFavorited(petPostId: string): Promise<boolean>;
  getFavoritePostIds(): Promise<string[]>;
  addFavorite(petPostId: string): Promise<void>;
  removeFavorite(petPostId: string): Promise<void>;
  toggleFavorite(petPostId: string): Promise<boolean>;
}
