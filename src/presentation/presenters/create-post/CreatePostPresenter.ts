/**
 * CreatePostPresenter
 * Handles business logic for creating pet posts
 * Receives repositories via dependency injection
 */

import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import type { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import type {
  IStorageRepository,
  UploadResult,
} from "@/application/repositories/IStorageRepository";
import type {
  CreatePetPostPayload,
  PetPost,
  PetType,
} from "@/domain/entities/pet-post";
import type { Metadata } from "next";

// ============================================================
// VIEW MODEL
// ============================================================

export interface CreatePostViewModel {
  petTypes: PetType[];
}

// ============================================================
// PRESENTER
// ============================================================

export class CreatePostPresenter {
  constructor(
    private readonly petPostRepository: IPetPostRepository,
    private readonly petTypeRepository: IPetTypeRepository,
    private readonly storageRepository: IStorageRepository,
  ) {}

  // ── View Model (Server Component) ──────────────────────

  async getViewModel(): Promise<CreatePostViewModel> {
    try {
      const petTypes = await this.petTypeRepository.getAll();
      return { petTypes };
    } catch (error) {
      console.error("Error getting create-post view model:", error);
      throw error;
    }
  }

  // ── Metadata ───────────────────────────────────────────

  generateMetadata(): Metadata {
    return {
      title: "โพสต์น้อง | StrayPetMap",
      description: "โพสต์น้องสัตว์จรเพื่อช่วยตามหาบ้านหรือเจ้าของ",
    };
  }

  // ── Granular Data Methods (Client Actions) ─────────────

  async uploadThumbnail(file: File): Promise<UploadResult> {
    try {
      return await this.storageRepository.uploadThumbnail(file);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    }
  }

  async createPost(data: CreatePetPostPayload): Promise<PetPost> {
    try {
      return await this.petPostRepository.create(data);
    } catch (error) {
      console.error("Error creating pet post:", error);
      throw error;
    }
  }

  async getPetTypes(): Promise<PetType[]> {
    try {
      return await this.petTypeRepository.getAll();
    } catch (error) {
      console.error("Error getting pet types:", error);
      throw error;
    }
  }
}
