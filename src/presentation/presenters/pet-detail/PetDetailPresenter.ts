import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import { createPetMetadata } from "@/config/metadata";
import type { PetPost, PetPostOutcome } from "@/domain/entities/pet-post";
import type { Metadata } from "next";

export interface PetDetailViewModel {
  post: PetPost;
}

export class PetDetailPresenter {
  constructor(private readonly repository: IPetPostRepository) {}

  async getViewModel(id: string): Promise<PetDetailViewModel | null> {
    try {
      // ใช้ getByIdWithOwner เพื่อดึงข้อมูลเจ้าของโพสต์มาด้วย
      const post = await this.repository.getByIdWithOwner(id);
      if (!post) return null;

      return { post };
    } catch (error) {
      console.error("Error getting pet detail view model:", error);
      throw error;
    }
  }

  generateMetadata(post: PetPost): Metadata {
    // Build pet-specific keywords
    const keywords = [
      "สัตว์หาบ้าน",
      "รับเลี้ยง",
      "adoption",
      post.petType?.name,
      post.breed,
      post.color,
      post.province,
    ].filter(Boolean) as string[];

    return createPetMetadata(
      post.title,
      post.description ||
        `ดูรายละเอียดของ ${post.title} - สนใจรับเลี้ยงหรือช่วยเหลือน้องได้ที่ StrayPetMap`,
      post.thumbnailUrl || undefined,
      post.id,
      keywords,
    );
  }

  async close(id: string, outcome: PetPostOutcome): Promise<PetPost> {
    return this.repository.close(id, outcome);
  }
}
