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
