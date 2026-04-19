import type { PetPost } from "@/domain/entities/pet-post";
import type {
  PublicProfile,
  PublicProfileSummary,
  PublicProfileWithPosts,
} from "@/domain/entities/public-profile";
import type { PaginationMode } from "./IPetPostRepository";

// ============================================================================
// QUERY RESULTS
// ============================================================================

export interface ProfilePostsQueryResult {
  posts: PetPost[];
  total: number;
  page?: number;
  perPage?: number;
  nextCursor?: string | null;
  hasMore: boolean;
}

/**
 * IPublicProfileRepository
 * Repository สำหรับดึงข้อมูล public profile ของผู้ใช้อื่น
 * ✅ ไม่ต้อง authentication (เปิดเผยต่อสาธารณะ)
 * ✅ ไม่มี sensitive data (email, auth_id, etc.)
 * ✅ รองรับ future features: follow, report, etc.
 */
export interface IPublicProfileRepository {
  /**
   * ดึง public profile ตาม profileId
   * @param profileId - UUID ของ profile ที่ต้องการดู
   */
  getById(profileId: string): Promise<PublicProfile | null>;

  /**
   * ดึง public profile พร้อมโพสต์ทั้งหมด
   * @param profileId - UUID ของ profile
   */
  getByIdWithPosts(profileId: string): Promise<PublicProfileWithPosts | null>;

  /**
   * ดึงโพสต์ทั้งหมดของ profile นั้น (รองรับทั้ง offset และ cursor pagination)
   * @param profileId - UUID ของ profile
   * @param pagination - รูปแบบ pagination (offset สำหรับ admin, cursor สำหรับ frontend)
   */
  getPosts(
    profileId: string,
    pagination: PaginationMode,
  ): Promise<ProfilePostsQueryResult>;

  /**
   * ดึง profile หลายคนพร้อม badge count (สำหรับ leaderboard)
   * @param limit - จำนวนที่ต้องการ
   */
  getTopProfiles(limit?: number): Promise<PublicProfileSummary[]>;

  /**
   * ตรวจสอบว่า profile มีอยู่จริงไหม
   * @param profileId - UUID ของ profile
   */
  exists(profileId: string): Promise<boolean>;
}
