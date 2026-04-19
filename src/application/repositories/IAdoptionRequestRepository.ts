import type { PaginationMode } from "@/domain/types/pagination";

export type AdoptionRequestStatus = "pending" | "approved" | "rejected";

export interface AdoptionRequest {
  id: string;
  petPostId: string;
  requesterProfileId: string;
  message: string | null;
  contactPhone: string | null;
  contactLineId: string | null;
  status: AdoptionRequestStatus;
  createdAt: string;
}

export interface CreateAdoptionRequestPayload {
  petPostId: string;
  message?: string;
  contactPhone?: string;
  contactLineId?: string;
}

// ============================================================================
// QUERY RESULTS
// ============================================================================

export interface AdoptionRequestQueryResult {
  data: AdoptionRequest[];
  total: number;
  page?: number;
  perPage?: number;
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface IAdoptionRequestRepository {
  create(payload: CreateAdoptionRequestPayload): Promise<AdoptionRequest>;

  /**
   * ดึงคำขอรับเลี้ยงตาม petPostId (รองรับทั้ง offset และ cursor pagination)
   * @param petPostId - UUID ของโพสต์
   * @param pagination - รูปแบบ pagination (offset สำหรับ admin, cursor สำหรับ frontend)
   */
  getByPostId(
    petPostId: string,
    pagination: PaginationMode,
  ): Promise<AdoptionRequestQueryResult>;

  /**
   * ดึงคำขอรับเลี้ยงของผู้ใช้ปัจจุบัน (รองรับทั้ง offset และ cursor pagination)
   * @param pagination - รูปแบบ pagination (offset สำหรับ admin, cursor สำหรับ frontend)
   */
  getMyRequests(
    pagination: PaginationMode,
  ): Promise<AdoptionRequestQueryResult>;

  hasRequested(petPostId: string): Promise<boolean>;
}
