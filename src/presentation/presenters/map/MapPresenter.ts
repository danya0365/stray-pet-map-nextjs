import type {
  IPetPostRepository,
  PetPostFilters,
  PetPostQueryResult,
} from "@/application/repositories/IPetPostRepository";
import type { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import type {
  PetPost,
  PetPostStats,
  PetType,
} from "@/domain/entities/pet-post";
import type { Metadata } from "next";

export interface MapViewModel {
  posts: PetPost[];
  stats: PetPostStats;
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string | null;
  petTypes: PetType[];
}

export class MapPresenter {
  constructor(
    private readonly repository: IPetPostRepository,
    private readonly petTypeRepository?: IPetTypeRepository,
  ) {}

  async getViewModel(filters?: PetPostFilters): Promise<MapViewModel> {
    try {
      const [queryResult, stats, petTypes] = await Promise.all([
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
        this.petTypeRepository?.getAll() ?? Promise.resolve([]),
      ]);

      return {
        posts: queryResult.data,
        stats,
        totalCount: queryResult.total,
        hasMore: queryResult.hasMore ?? false,
        nextCursor: queryResult.nextCursor,
        petTypes,
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
