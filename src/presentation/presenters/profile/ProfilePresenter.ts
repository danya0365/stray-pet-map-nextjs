/**
 * ProfilePresenter
 * Handles business logic for Profile management
 * Receives repository via dependency injection
 */

import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { IBadgeRepository } from "@/application/repositories/IBadgeRepository";
import type { IProfileBadgeRepository } from "@/application/repositories/IProfileBadgeRepository";
import type { Badge, BadgeProgress } from "@/domain/entities/badge";
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
}

/**
 * Presenter for Profile management
 * ✅ Receives repositories via constructor injection (not Supabase directly)
 * ✅ Following Clean Architecture pattern
 */
export class ProfilePresenter {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly badgeRepository:
      | IBadgeRepository
      | IProfileBadgeRepository,
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
        // Check which interface is being used
        if ("getByProfileId" in this.badgeRepository) {
          // Server-side: IBadgeRepository with profileId parameter
          const repo = this.badgeRepository as IBadgeRepository;
          [badges, badgeProgress] = await Promise.all([
            repo.getByProfileId(profile.id),
            repo.getProgress(profile.id),
          ]);
        } else {
          // Client-side: IProfileBadgeRepository - auto-detects active profile
          const repo = this.badgeRepository as IProfileBadgeRepository;
          [badges, badgeProgress] = await Promise.all([
            repo.getBadges(),
            repo.getProgress(),
          ]);
        }
      }

      return {
        user,
        profile,
        profiles: profiles || [],
        hasMultipleProfiles: (profiles || []).length > 1,
        badges: badges || [],
        totalBadges: badges?.length || 0,
        badgeProgress: badgeProgress || [],
      };
    } catch (error) {
      console.error("Error getting profile view model:", error);
      throw error;
    }
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: "โปรไฟล์ของฉัน | StrayPetMap",
      description: "จัดการโปรไฟล์และตราสัญลักษณ์ของคุณ",
    };
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
  async getBadges(profileId: string): Promise<Badge[]> {
    try {
      if ("getByProfileId" in this.badgeRepository) {
        return await (this.badgeRepository as IBadgeRepository).getByProfileId(
          profileId,
        );
      }
      return await (
        this.badgeRepository as IProfileBadgeRepository
      ).getBadges();
    } catch (error) {
      console.error("Error getting badges:", error);
      throw error;
    }
  }

  /**
   * Get badge progress for current profile
   */
  async getBadgeProgress(profileId: string): Promise<BadgeProgress[]> {
    try {
      if ("getProgress" in this.badgeRepository) {
        const repo = this.badgeRepository as IBadgeRepository;
        if ("getProgress" in repo) {
          return await repo.getProgress(profileId);
        }
      }
      return await (
        this.badgeRepository as IProfileBadgeRepository
      ).getProgress();
    } catch (error) {
      console.error("Error getting badge progress:", error);
      throw error;
    }
  }
}
