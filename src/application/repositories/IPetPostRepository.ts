import type {
  CreatePetPostPayload,
  PetGender,
  PetPost,
  PetPostPurpose,
  PetPostStats,
  PetPostStatus,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";

// ============================================================
// PAGINATION
// ============================================================

export type OffsetPagination = {
  type: "offset";
  page: number;
  perPage: number;
};

export type CursorPagination = {
  type: "cursor";
  cursor?: string;
  limit: number;
};

export type PaginationMode = OffsetPagination | CursorPagination;

// ============================================================
// QUERY PARAMS
// ============================================================

export interface PetPostFilters {
  purpose?: PetPostPurpose | PetPostPurpose[]; // กรองตามจุดประสงค์โพสต์
  status?: PetPostStatus | PetPostStatus[]; // กรองตามสถานะระบบ
  petTypeId?: string;
  gender?: PetGender;
  province?: string;
  isVaccinated?: boolean;
  isNeutered?: boolean;
  profileId?: string;
}

export interface NearByFilter {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export type PetPostSortField = "createdAt" | "updatedAt" | "title" | "distance";
export type SortOrder = "asc" | "desc";

export interface PetPostQuery {
  filters?: PetPostFilters;
  search?: string;
  nearBy?: NearByFilter;
  sortBy?: PetPostSortField;
  sortOrder?: SortOrder;
  pagination: PaginationMode;
}

// ============================================================
// QUERY RESULT
// ============================================================

export interface PetPostQueryResult {
  data: PetPost[];
  total: number;
  page?: number;
  perPage?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
}

// ============================================================
// REPOSITORY INTERFACE
// ============================================================

export interface IPetPostRepository {
  query(params: PetPostQuery): Promise<PetPostQueryResult>;

  getById(id: string): Promise<PetPost | null>;

  create(data: CreatePetPostPayload): Promise<PetPost>;

  update(id: string, data: UpdatePetPostData): Promise<PetPost>;

  delete(id: string): Promise<boolean>;

  getStats(filters?: PetPostFilters): Promise<PetPostStats>;
}
