import type {
  IPetPostRepository,
  NearByFilter,
  PetPostFilters,
  PetPostQueryResult,
  PetPostSortField,
  SortOrder,
} from "@/application/repositories/IPetPostRepository";
import type { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import type { PetPostStats, PetType } from "@/domain/entities/pet-post";
import type { Metadata } from "next";

export interface SearchViewModel {
  result: PetPostQueryResult;
  stats: PetPostStats;
  filters: PetPostFilters;
  search: string;
  sortBy: PetPostSortField;
  sortOrder: SortOrder;
  petTypes: PetType[];
}

export interface SearchParams {
  filters?: PetPostFilters;
  search?: string;
  nearBy?: NearByFilter;
  sortBy?: PetPostSortField;
  sortOrder?: SortOrder;
  page?: number;
  perPage?: number;
}

const DEFAULT_PER_PAGE = 12;

export class SearchPresenter {
  constructor(
    private readonly repository: IPetPostRepository,
    private readonly petTypeRepository: IPetTypeRepository,
  ) {}

  async getViewModel(params: SearchParams = {}): Promise<SearchViewModel> {
    const {
      filters = {},
      search = "",
      nearBy,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      perPage = DEFAULT_PER_PAGE,
    } = params;

    try {
      const [result, stats, petTypes] = await Promise.all([
        this.repository.query({
          filters,
          search: search || undefined,
          nearBy,
          sortBy,
          sortOrder,
          pagination: { type: "offset", page, perPage },
        }),
        this.repository.getStats(filters),
        this.petTypeRepository.getAll(),
      ]);

      return { result, stats, filters, search, sortBy, sortOrder, petTypes };
    } catch (error) {
      console.error("Error getting search view model:", error);
      throw error;
    }
  }

  async loadMore(
    params: SearchParams & { page: number },
  ): Promise<PetPostQueryResult> {
    const {
      filters = {},
      search = "",
      nearBy,
      sortBy = "createdAt",
      sortOrder = "desc",
      page,
      perPage = DEFAULT_PER_PAGE,
    } = params;

    try {
      return await this.repository.query({
        filters,
        search: search || undefined,
        nearBy,
        sortBy,
        sortOrder,
        pagination: { type: "offset", page, perPage },
      });
    } catch (error) {
      console.error("Error loading more search results:", error);
      throw error;
    }
  }

  generateMetadata(): Metadata {
    return {
      title: "ค้นหาสัตว์ | StrayPetMap",
      description:
        "ค้นหาสัตว์จรทั่วประเทศไทย กรองตามชนิด พันธุ์ สี สถานะ และตำแหน่ง",
    };
  }
}
