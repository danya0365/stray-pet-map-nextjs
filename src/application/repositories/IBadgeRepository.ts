import type {
  Badge,
  BadgeProgress,
  BadgeTier,
  BadgeType,
  ProfileWithBadges,
} from "@/domain/entities/badge";

export interface IBadgeRepository {
  // ดึง badges ทั้งหมดของผู้ใช้
  getByProfileId(profileId: string): Promise<Badge[]>;

  // ดึงข้อมูลผู้ใชพร้อม badges และ progress
  getProfileWithBadges(profileId: string): Promise<ProfileWithBadges | null>;

  // มอบ badge ให้ผู้ใช้
  awardBadge(
    profileId: string,
    type: BadgeType,
    tier: string,
    earnedValue?: number,
  ): Promise<Badge>;

  // ตรวจสอบว่าผู้ใช้มี badge นี้แล้วหรือยัง
  hasBadge(
    profileId: string,
    type: BadgeType,
    tier?: BadgeTier,
  ): Promise<boolean>;

  // ดึง leaderboard ผู้ใช้ที่มี badges มากที่สุด
  getLeaderboard(limit?: number): Promise<ProfileWithBadges[]>;

  // ดึง progress ของผู้ใช้สำหรับ badge ประเภทต่างๆ
  getProgress(profileId: string): Promise<BadgeProgress[]>;

  // คำนวณและอัปเดต progress อัตโนมัติ
  calculateProgress(profileId: string): Promise<BadgeProgress[]>;
}
