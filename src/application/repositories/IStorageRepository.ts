/**
 * IStorageRepository
 * Repository interface for file storage operations
 * Following Clean Architecture - Application layer
 */

// ============================================================
// TYPES
// ============================================================

export interface UploadResult {
  url: string;
  path: string;
}

// ============================================================
// REPOSITORY INTERFACE
// ============================================================

export interface IStorageRepository {
  /**
   * Upload a thumbnail image
   * @param file - The image file to upload
   * @returns The public URL and storage path
   */
  uploadThumbnail(file: File): Promise<UploadResult>;

  /**
   * Upload an avatar image
   * @param file - The image file to upload
   * @returns The public URL and storage path
   */
  uploadAvatar(file: File): Promise<UploadResult>;
}
