/**
 * IPetPostLikeRepository
 * Repository interface for pet post like operations (Clean Architecture)
 */

export interface IPetPostLikeRepository {
  /**
   * Check whether current user has liked a pet post
   */
  isLiked(petPostId: string): Promise<boolean>;

  /**
   * Get total like count for a pet post
   */
  getLikeCount(petPostId: string): Promise<number>;

  /**
   * Toggle like on a pet post
   * @returns true if liked, false if unliked
   */
  toggleLike(petPostId: string): Promise<boolean>;
}
