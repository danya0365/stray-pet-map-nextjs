import type {
  CreatePetPostPayload,
  PetGender,
  PetPost,
  PetPostOutcome,
  PetPostPurpose,
  PetPostStats,
  PetPostStatus,
  UpdatePetPostData,
} from "@/domain/entities/pet-post";
import type { PaginationMode } from "@/domain/types/pagination";

// ============================================================
// QUERY PARAMS
// ============================================================

export interface PetPostFilters {
  purpose?: PetPostPurpose | PetPostPurpose[]; // กรองตามจุดประสงค์โพสต์
  status?: PetPostStatus | PetPostStatus[]; // กรองตามสถานะระบบ
  outcome?: PetPostOutcome | PetPostOutcome[]; // กรองตามผลลัพธ์
  isArchived?: boolean; // กรองตามสถานะ archive
  petTypeId?: string;
  gender?: PetGender;
  province?: string;
  breed?: string; // กรองตามสายพันธุ์
  color?: string; // กรองตามสี
  isVaccinated?: boolean;
  isNeutered?: boolean;
  profileId?: string;
  estimatedAge?: string; // กรองตามช่วงอายุ เช่น "0-1", "1-3", "3-5", "5+"
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

  /**
   * ดึงโพสต์พร้อมข้อมูลเจ้าของ (full_name, avatar_url)
   * ใช้สำหรับแสดงลิงก์ไปยังโปรไฟล์เจ้าของโพสต์
   */
  getByIdWithOwner(id: string): Promise<PetPost | null>;

  create(data: CreatePetPostPayload): Promise<PetPost>;

  update(id: string, data: UpdatePetPostData): Promise<PetPost>;

  delete(id: string): Promise<boolean>;

  getStats(filters?: PetPostFilters): Promise<PetPostStats>;

  // ดึงเรื่องราวความสำเร็จ (โพสต์ที่ outcome = owner_found หรือ rehomed)
  getSuccessStories(limit?: number): Promise<PetPost[]>;

  // ดึงโพสต์ที่หมดอายุ (สำหรับ auto-archive)
  findExpiredPosts(
    expiryDays: number,
  ): Promise<{ id: string; createdAt: string }[]>;

  // ดึงโพสต์ที่ใกล้หมดอายุ (สำหรับแจ้งเตือน)
  findExpiringSoonPosts(
    expiryDays: number,
    warningDays: number,
  ): Promise<
    { id: string; title: string; createdAt: string; purpose: string }[]
  >;

  // ปิดโพสต์ (เมื่อหาเจ้าของเจอ/รับเลี้ยงแล้ว)
  close(id: string, outcome: PetPostOutcome): Promise<PetPost>;
}
