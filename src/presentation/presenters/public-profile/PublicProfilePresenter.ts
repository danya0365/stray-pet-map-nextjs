/**
 * PublicProfilePresenter
 * Handles business logic for public profile operations
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type {
  IPublicProfileRepository,
  ProfilePostsQueryResult,
} from "@/application/repositories/IPublicProfileRepository";
import type {
  PublicProfile,
  PublicProfileWithPosts,
} from "@/domain/entities/public-profile";
import type { PaginationMode } from "@/domain/types/pagination";

export interface ProfileResult {
  success: boolean;
  profile?: PublicProfile;
  error?: string;
}

export interface ExistsResult {
  success: boolean;
  exists?: boolean;
  error?: string;
}

export interface PostsResult {
  success: boolean;
  data?: ProfilePostsQueryResult;
  error?: string;
}

/**
 * Presenter for public profile operations
 * ✅ Receives repository via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class PublicProfilePresenter {
  constructor(private readonly repository: IPublicProfileRepository) {}

  // ============================================================
  // QUERY METHODS (For API Routes)
  // ============================================================

  /**
   * Get public profile by ID
   * Used by /api/profiles/[profileId] GET route
   */
  async getById(profileId: string): Promise<ProfileResult> {
    try {
      const profile = await this.repository.getById(profileId);

      if (!profile) {
        return { success: false, error: "Profile not found" };
      }

      return { success: true, profile };
    } catch (error) {
      console.error("Error fetching public profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch profile";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if profile exists
   * Used by /api/profiles/[profileId]/exists GET route
   */
  async exists(profileId: string): Promise<ExistsResult> {
    try {
      const exists = await this.repository.exists(profileId);
      return { success: true, exists };
    } catch (error) {
      console.error("Error checking profile existence:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to check profile";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get posts by profile ID with pagination
   * Used by /api/profiles/[profileId]/posts GET route
   */
  async getPosts(
    profileId: string,
    pagination: PaginationMode,
  ): Promise<PostsResult> {
    try {
      // Verify profile exists first
      const exists = await this.repository.exists(profileId);
      if (!exists) {
        return { success: false, error: "Profile not found" };
      }

      const result = await this.repository.getPosts(profileId, pagination);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error fetching profile posts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch posts";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get profile with posts
   * Used for combined profile + posts view
   */
  async getByIdWithPosts(profileId: string): Promise<{
    success: boolean;
    profile?: PublicProfileWithPosts;
    error?: string;
  }> {
    try {
      const profile = await this.repository.getByIdWithPosts(profileId);

      if (!profile) {
        return { success: false, error: "Profile not found" };
      }

      return { success: true, profile };
    } catch (error) {
      console.error("Error fetching profile with posts:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch profile";
      return { success: false, error: errorMessage };
    }
  }
}
