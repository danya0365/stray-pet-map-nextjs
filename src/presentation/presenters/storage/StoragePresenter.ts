/**
 * StoragePresenter
 * Handles business logic for file storage operations
 * Receives repositories via dependency injection
 * Following Clean Architecture pattern
 */

import type { IStorageRepository } from "@/application/repositories/IStorageRepository";

// ============================================================
// RESULT TYPES (For API Routes)
// ============================================================

export interface UploadFileResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// ============================================================
// STORAGE PRESENTER
// ============================================================

export class StoragePresenter {
  constructor(private readonly storageRepo: IStorageRepository) {}

  /**
   * Upload a thumbnail image
   * NOTE: Auth check should be done in API Route before calling this method
   */
  async uploadThumbnail(file: File): Promise<UploadFileResult> {
    try {
      // Upload via storage repository
      const result = await this.storageRepo.uploadThumbnail(file);

      return {
        success: true,
        url: result.url,
        path: result.path,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      return {
        success: false,
        error: message,
      };
    }
  }

  async uploadAvatar(file: File): Promise<UploadFileResult> {
    try {
      const result = await this.storageRepo.uploadAvatar(file);
      return {
        success: true,
        url: result.url,
        path: result.path,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      return {
        success: false,
        error: message,
      };
    }
  }
}
