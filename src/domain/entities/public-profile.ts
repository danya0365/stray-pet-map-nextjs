import type { Badge, BadgeProgress } from "./badge";
import type { PetPost } from "./pet-post";

/**
 * Public Profile Entity
 * ข้อมูลโปรไฟล์ที่เปิดเผยต่อสาธารณะ (ไม่มี sensitive data)
 */
export interface PublicProfile {
  id: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  badges: Badge[];
  badgeProgress: BadgeProgress[];
  stats: PublicProfileStats;
  joinedAt: string;
  isVerified: boolean;
}

export interface PublicProfileStats {
  totalPosts: number;
  helpedCount: number; // rehomed + owner_found
  totalBadges: number;
  // รองรับ future stats
  followersCount?: number;
  followingCount?: number;
}

export interface PublicProfileWithPosts extends PublicProfile {
  posts: PetPost[];
}

/**
 * Summary version สำหรับแสดงใน list (leaderboard, etc.)
 */
export interface PublicProfileSummary {
  id: string;
  displayName: string;
  avatarUrl?: string;
  totalBadges: number;
  helpedCount: number;
}
