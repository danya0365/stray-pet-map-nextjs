/**
 * ApiStorageRepository
 * Implements IStorageRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  IStorageRepository,
  UploadFileDTO,
  UploadResult,
} from "@/application/repositories/IStorageRepository";

export class ApiStorageRepository implements IStorageRepository {
  private baseUrl = "/api/storage";

  async uploadImage(data: UploadFileDTO): Promise<string> {
    const formData = new FormData();

    const fileBlob =
      data.buffer instanceof Blob
        ? data.buffer
        : new Blob([data.buffer as BlobPart], { type: data.contentType });

    formData.append("file", fileBlob, data.fileName);
    formData.append("fileName", data.fileName);
    formData.append("contentType", data.contentType);
    formData.append("bucket", data.bucket);
    if (data.folder) formData.append("folder", data.folder);

    const res = await fetch(`${this.baseUrl}/image`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปโหลดไฟล์ได้");
    }

    const result = await res.json();
    return result.url;
  }

  async uploadBase64(
    base64Data: string,
    fileName: string,
    bucket: string,
    folder?: string,
  ): Promise<string> {
    const res = await fetch(`${this.baseUrl}/base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Data, fileName, bucket, folder }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปโหลดไฟล์ได้");
    }

    const result = await res.json();
    return result.url;
  }

  async uploadThumbnail(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/thumbnail`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปโหลดรูปภาพได้");
    }

    return res.json();
  }

  async uploadAvatar(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${this.baseUrl}/avatar`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถอัปโหลดรูปภาพได้");
    }

    return res.json();
  }
}
