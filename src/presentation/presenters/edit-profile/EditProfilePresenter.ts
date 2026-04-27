/**
 * EditProfilePresenter
 * Handles business logic for editing a user profile
 * Depends directly on repository interfaces (Clean Architecture)
 */

import type {
  AuthProfile,
  IAuthRepository,
} from "@/application/repositories/IAuthRepository";
import type { IStorageRepository } from "@/application/repositories/IStorageRepository";

export interface EditProfileResult {
  profile: AuthProfile | null;
  error: string | null;
}

export interface UploadAvatarResult {
  url: string | null;
  error: string | null;
}

export class EditProfilePresenter {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly storageRepository: IStorageRepository,
  ) {}

  /**
   * Update current profile
   */
  async updateProfile(data: {
    fullName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<EditProfileResult> {
    try {
      const result = await this.authRepository.updateProfile(data);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      return { profile: null, error: message };
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File): Promise<UploadAvatarResult> {
    try {
      const result = await this.storageRepository.uploadAvatar(file);
      return { url: result.url, error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ";
      return { url: null, error: message };
    }
  }
}
