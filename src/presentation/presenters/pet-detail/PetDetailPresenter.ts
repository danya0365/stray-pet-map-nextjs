import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import type { PetPost } from "@/domain/entities/pet-post";
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
    return {
      title: `${post.title} | StrayPetMap`,
      description: post.description || `ดูรายละเอียดของ ${post.title}`,
      openGraph: {
        title: post.title,
        description: post.description,
        images: post.thumbnailUrl ? [{ url: post.thumbnailUrl }] : undefined,
      },
    };
  }
}
