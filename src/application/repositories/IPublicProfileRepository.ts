import type {
  PublicProfile,
  PublicProfileWithPosts,
  PublicProfileSummary,
} from "@/domain/entities/public-profile";
import type { PetPost } from "@/domain/entities/pet-post";

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
   * ดึงโพสต์ทั้งหมดของ profile นั้น (paginated)
   * @param profileId - UUID ของ profile
   * @param page - หน้าที่ต้องการ (default: 1)
   * @param perPage - จำนวนต่อหน้า (default: 10)
   */
  getPosts(
    profileId: string,
    page?: number,
    perPage?: number,
  ): Promise<{
    posts: PetPost[];
    total: number;
    hasMore: boolean;
  }>;

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
