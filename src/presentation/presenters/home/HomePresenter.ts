import type { IPetPostRepository } from "@/application/repositories/IPetPostRepository";
import type { PetPost, PetPostStats } from "@/domain/entities/pet-post";
import type { Metadata } from "next";

export interface HomeViewModel {
  recentPosts: PetPost[];
  stats: PetPostStats;
  totalCount: number;
}

export class HomePresenter {
  constructor(private readonly repository: IPetPostRepository) {}

  async getViewModel(): Promise<HomeViewModel> {
    try {
      const [queryResult, stats] = await Promise.all([
        this.repository.query({
          filters: { status: ["available", "missing", "pending"] },
          sortBy: "createdAt",
          sortOrder: "desc",
          pagination: { type: "offset", page: 1, perPage: 6 },
        }),
        this.repository.getStats(),
      ]);

      return {
        recentPosts: queryResult.data,
        stats,
        totalCount: queryResult.total,
      };
    } catch (error) {
      console.error("Error getting home view model:", error);
      throw error;
    }
  }

  generateMetadata(): Metadata {
    return {
      title: "StrayPetMap — ช่วยให้สัตว์มีบ้าน",
      description:
        "แพลตฟอร์มกลางสำหรับโพสต์ตำแหน่งสัตว์จร ค้นหาสัตว์ตามสเปก และเชื่อมคนอยากเลี้ยงกับคนช่วยสัตว์",
    };
  }

  async getStats(): Promise<PetPostStats> {
    try {
      return await this.repository.getStats();
    } catch (error) {
      console.error("Error getting stats:", error);
      throw error;
    }
  }
}
