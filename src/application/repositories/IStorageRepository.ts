/**
 * IStorageRepository
 * Repository interface for file storage operations
 * Following Clean Architecture - Application layer
 */

// ============================================================
// TYPES
// ============================================================

export interface UploadFileDTO {
  buffer: Buffer | ArrayBuffer | File | Blob;
  fileName: string;
  contentType: string;
  bucket: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

// ============================================================
// REPOSITORY INTERFACE
// ============================================================

export interface IStorageRepository {
  /**
   * Upload a file to storage
   * @returns Public URL of the uploaded file
   */
  uploadImage(data: UploadFileDTO): Promise<string>;

  /**
   * Upload a base64 encoded file
   * @returns Public URL of the uploaded file
   */
  uploadBase64(
    base64Data: string,
    fileName: string,
    bucket: string,
    folder?: string,
  ): Promise<string>;

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
