import type { IPetPostRepository, PetPostQueryResult, PetPostFilters } from "@/application/repositories/IPetPostRepository";
import type { PetPost, PetPostStats } from "@/domain/entities/pet-post";
import type { Metadata } from "next";

export interface MapViewModel {
  posts: PetPost[];
  stats: PetPostStats;
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

export class MapPresenter {
  constructor(private readonly repository: IPetPostRepository) {}

  async getViewModel(filters?: PetPostFilters): Promise<MapViewModel> {
    try {
      const [queryResult, stats] = await Promise.all([
        this.repository.query({
          filters: {
            status: ["available", "missing", "pending"],
            ...filters,
          },
          sortBy: "createdAt",
          sortOrder: "desc",
          pagination: { type: "cursor", limit: 50 },
        }),
        this.repository.getStats(filters),
      ]);

      return {
        posts: queryResult.data,
        stats,
        totalCount: queryResult.total,
        hasMore: queryResult.hasMore ?? false,
        nextCursor: queryResult.nextCursor,
      };
    } catch (error) {
      console.error("Error getting map view model:", error);
      throw error;
    }
  }

  async loadMore(
    cursor: string,
    filters?: PetPostFilters,
  ): Promise<PetPostQueryResult> {
    try {
      return await this.repository.query({
        filters: {
          status: ["available", "missing", "pending"],
          ...filters,
        },
        sortBy: "createdAt",
        sortOrder: "desc",
        pagination: { type: "cursor", cursor, limit: 50 },
      });
    } catch (error) {
      console.error("Error loading more map posts:", error);
      throw error;
    }
  }

  generateMetadata(): Metadata {
    return {
      title: "แผนที่สัตว์จร | StrayPetMap",
      description:
        "ดูตำแหน่งสัตว์จรทั่วประเทศไทยบนแผนที่ ค้นหาน้องหมาน้องแมวใกล้บ้านคุณ",
    };
  }
}
