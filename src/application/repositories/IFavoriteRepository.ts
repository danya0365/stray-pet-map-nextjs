import type { PaginationMode } from "./IPetPostRepository";

// ============================================================================
// QUERY RESULTS
// ============================================================================

export interface FavoriteQueryResult {
  postIds: string[];
  total: number;
  page?: number;
  perPage?: number;
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface IFavoriteRepository {
  isFavorited(petPostId: string): Promise<boolean>;

  /**
   * ดึงรายการ postIds ที่ผู้ใช้ favorite (รองรับทั้ง offset และ cursor pagination)
   * @param pagination - รูปแบบ pagination (offset สำหรับ admin, cursor สำหรับ frontend)
   */
  getFavoritePostIds(pagination?: PaginationMode): Promise<FavoriteQueryResult>;

  addFavorite(petPostId: string): Promise<void>;
  removeFavorite(petPostId: string): Promise<void>;
  toggleFavorite(petPostId: string): Promise<boolean>;
}
