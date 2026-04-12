/**
 * IRoadMapRepository
 * Repository interface for RoadMap data access
 * Following Clean Architecture - this is in the Application layer
 */

export type RoadMapTier =
  | "free"
  | "seed"
  | "sprout"
  | "bloom"
  | "champion"
  | "legend";

export type FeatureStatus = "done" | "in_progress" | "locked";

export interface RoadMapFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: FeatureStatus;
  /**
   * กำหนดการปกติ — ฟีเจอร์นี้จะทำแน่นอนภายใน quarter นี้
   * ไม่ว่ายอดบริจาคจะถึงหรือไม่
   * ตัวอย่าง: "Q3 2026", "Q4 2026"
   */
  plannedQuarter?: string;
  /**
   * Fast-track goal — ถ้ายอดบริจาคสะสมถึงจำนวนนี้
   * เราจะเริ่มทำทันที โดยไม่ต้องรอ deadline
   * ตั้งใจให้น้อยกว่า targetAmount ของ tier หรือเท่ากัน
   */
  donationGoal?: number;
}

export interface RoadMapTierData {
  id: RoadMapTier;
  emoji: string;
  title: string;
  subtitle: string;
  targetAmount: number; /** ยอดบริจาคสะสมที่ต้องถึง (บาท) */
  color: string; /** Tailwind color token เช่น "primary" */
  gradientFrom: string;
  gradientTo: string;
  features: RoadMapFeature[];
}

export interface RoadMapStats {
  currentAmount: number;   /** ยอดบริจาคสะสมปัจจุบัน (บาท) */
  donorCount: number;      /** จำนวนผู้บริจาค */
  currentTier: RoadMapTier;
  nextTier: RoadMapTier | null;
  progressPercent: number; /** % ความคืบหน้าสู่ tier ถัดไป */
}

export interface RoadMapViewModel {
  tiers: RoadMapTierData[];
  stats: RoadMapStats;
}

export interface IRoadMapRepository {
  getTiers(): Promise<RoadMapTierData[]>;
  getStats(): Promise<RoadMapStats>;
}
