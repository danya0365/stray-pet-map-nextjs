/**
 * ProfilePresenter
 * Handles business logic for Profile management
 * Receives repository via dependency injection
 */

import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import type { IProfileBadgeRepository } from "@/application/repositories/IProfileBadgeRepository";
import { createBaseMetadata, createProfileMetadata } from "@/config/metadata";
import type { Badge, BadgeProgress } from "@/domain/entities/badge";
import type { PetPost } from "@/domain/entities/pet-post";
import type { User } from "@supabase/supabase-js";
import type { Metadata } from "next";

export interface ProfileViewModel {
  user: User | null;
  profile: AuthProfile | null;
  profiles: AuthProfile[];
  hasMultipleProfiles: boolean;
  badges: Badge[];
  totalBadges: number;
  badgeProgress: BadgeProgress[];
  posts: PetPost[];
  totalPosts: number;
  stats: {
    posts: number;
    helped: number; // pets that found home through user's posts
    points: number;
  };
}

/**
 * Presenter for Profile management
 * ✅ Receives repositories via constructor injection (not Supabase directly)
 * ✅ Following Clean Architecture pattern
 */
export class ProfilePresenter {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly badgeRepository: IProfileBadgeRepository,
    private readonly petPostRepository: IPetPostRepository,
  ) {}

  // ============================================================
  // VIEW MODEL METHODS (For Client/Server Components)
  // ============================================================

  /**
   * Get view model for the profile page
   * ⚠️ Use this ONLY for rendering UI views
   */
  async getViewModel(): Promise<ProfileViewModel> {
    try {
      const [user, profile, profiles] = await Promise.all([
        this.authRepository.getUser(),
        this.authRepository.getProfile(),
        this.authRepository.getProfiles(),
      ]);

      // Fetch badges if profile exists
      let badges: Badge[] = [];
      let badgeProgress: BadgeProgress[] = [];
      if (profile?.id) {
        [badges, badgeProgress] = await Promise.all([
          this.badgeRepository.getBadges(),
          this.badgeRepository.getProgress(),
        ]);
      }

      // Fetch user's posts
      let posts: PetPost[] = [];
      if (profile?.id) {
        try {
          const result = await this.petPostRepository.query({
            filters: { profileId: profile.id },
            pagination: { type: "offset", page: 1, perPage: 100 },
            sortBy: "createdAt",
            sortOrder: "desc",
          });
          posts = result.data;
        } catch (err) {
          console.error("Error fetching user posts:", err);
        }
      }

      // Calculate stats
      const helpedCount = posts.filter(
        (p) => p.outcome === "rehomed" || p.outcome === "owner_found",
      ).length;

      return {
        user,
        profile,
        profiles: profiles || [],
        hasMultipleProfiles: (profiles || []).length > 1,
        badges: badges || [],
        totalBadges: badges?.length || 0,
        badgeProgress: badgeProgress || [],
        posts: posts || [],
        totalPosts: posts?.length || 0,
        stats: {
          posts: posts?.length || 0,
          helped: helpedCount,
          points: 0, // TODO: Get from gamification system when implemented
        },
      };
    } catch (error) {
      console.error("Error getting profile view model:", error);
      throw error;
    }
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(profile?: AuthProfile): Metadata {
    if (profile) {
      const displayName = profile.fullName || profile.username || "ผู้ใช้";
      return createProfileMetadata(displayName, profile.avatarUrl || undefined);
    }

    return createBaseMetadata(
      "โปรไฟล์ของฉัน | StrayPetMap",
      "จัดการโปรไฟล์และตราสัญลักษณ์ของคุณ - ดูสถิติการช่วยเหลือสัตว์และโพสต์ของคุณ",
      {
        url: "/profile",
        keywords: ["โปรไฟล์", "profile", "badges", "stats"],
      },
    );
  }

  // ============================================================
  // GRANULAR DATA METHODS (For API Routes & Individual Actions)
  // ============================================================

  /**
   * Switch to a different profile
   */
  async switchProfile(profileId: string): Promise<AuthProfile | null> {
    try {
      return await this.authRepository.switchProfile(profileId);
    } catch (error) {
      console.error("Error switching profile:", error);
      throw error;
    }
  }

  /**
   * Get all profiles for current user
   */
  async getProfiles(): Promise<AuthProfile[]> {
    try {
      return await this.authRepository.getProfiles();
    } catch (error) {
      console.error("Error getting profiles:", error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<User | null> {
    try {
      return await this.authRepository.getUser();
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  /**
   * Get current profile
   */
  async getProfile(): Promise<AuthProfile | null> {
    try {
      return await this.authRepository.getProfile();
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
  }

  /**
   * Get badges for current profile
   */
  async getBadges(_profileId: string): Promise<Badge[]> {
    try {
      return await this.badgeRepository.getBadges();
    } catch (error) {
      console.error("Error getting badges:", error);
      throw error;
    }
  }

  /**
   * Get badge progress for current profile
   */
  async getBadgeProgress(_profileId: string): Promise<BadgeProgress[]> {
    try {
      return await this.badgeRepository.getProgress();
    } catch (error) {
      console.error("Error getting badge progress:", error);
      throw error;
    }
  }

  /**
   * Delete a pet post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      return await this.petPostRepository.delete(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }
}
