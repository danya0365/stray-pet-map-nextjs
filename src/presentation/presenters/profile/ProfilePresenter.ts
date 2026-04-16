/**
 * ProfilePresenter
 * Handles business logic for Profile management
 * Receives repository via dependency injection
 */

import type { Metadata } from "next";
import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { User } from "@supabase/supabase-js";

export interface ProfileViewModel {
  user: User | null;
  profile: AuthProfile | null;
  profiles: AuthProfile[];
  hasMultipleProfiles: boolean;
}

/**
 * Presenter for Profile management
 * ✅ Receives repository via constructor injection (not Supabase directly)
 */
export class ProfilePresenter {
  constructor(private readonly authRepository: IAuthRepository) {}

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

      return {
        user,
        profile,
        profiles: profiles || [],
        hasMultipleProfiles: (profiles || []).length > 1,
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
}
