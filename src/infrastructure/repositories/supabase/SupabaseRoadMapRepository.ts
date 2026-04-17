/**
 * SupabaseRoadMapRepository
 * Real data from Supabase for Road Map page
 * Following Clean Architecture - Infrastructure layer
 */

import {
  IRoadMapRepository,
  RoadMapStats,
  RoadMapTier,
  RoadMapTierData,
} from "@/application/repositories/IRoadMapRepository";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

// Tier thresholds for progress calculation
const THRESHOLDS: { tier: RoadMapTier; amount: number }[] = [
  { tier: "free", amount: 0 },
  { tier: "seed", amount: 5000 },
  { tier: "sprout", amount: 15000 },
  { tier: "bloom", amount: 30000 },
  { tier: "champion", amount: 60000 },
  { tier: "legend", amount: 100000 },
];

// Static tier content (editorial - doesn't change)
const TIERS: RoadMapTierData[] = [
  // ──── Tier 0: ฟรีเสมอ (baseline) ────
  {
    id: "free",
    emoji: "🐾",
    title: "ฟรีเสมอ",
    subtitle: "ฟีเจอร์พื้นฐานที่ทุกคนใช้ได้ตลอด",
    targetAmount: 0,
    color: "secondary",
    gradientFrom: "#7ecec0",
    gradientTo: "#5aab9e",
    features: [
      {
        id: "f-map",
        icon: "🗺️",
        title: "แผนที่สัตว์จรทั่วไทย",
        description: "ดู pin สัตว์จรบนแผนที่แบบ real-time",
        status: "done",
      },
      {
        id: "f-post",
        icon: "📸",
        title: "โพสต์น้อง",
        description: "แจ้งพิกัด รูปภาพ และรายละเอียดน้องสัตว์ได้ทันที",
        status: "done",
      },
      {
        id: "f-search",
        icon: "🔍",
        title: "ค้นหาตามสเปก",
        description: "กรองตามชนิด สถานะ และจุดประสงค์",
        status: "done",
      },
      {
        id: "f-adopt",
        icon: "🏡",
        title: "ขอรับเลี้ยง",
        description: "ส่งคำขอรับเลี้ยงพร้อมระบบแจ้งเตือนเจ้าของ",
        status: "done",
      },
      {
        id: "f-badges",
        icon: "🎖️",
        title: "ระบบ Badges",
        description: "สะสมตราสัญลักษณ์จากการช่วยเหลือสัตว์",
        status: "done",
      },
    ],
  },

  // ──── Tier 1: Seed — ฿5,000 ────
  {
    id: "seed",
    emoji: "🌱",
    title: "ระยะ Seed",
    subtitle: "เมล็ดพันธุ์แห่งความหวัง",
    targetAmount: 5000,
    color: "primary",
    gradientFrom: "#f2845c",
    gradientTo: "#e8603a",
    features: [
      {
        id: "s-geocoding",
        icon: "📍",
        title: "Reverse Geocoding อัตโนมัติ",
        description: "แปลง GPS → ชื่อที่อยู่อัตโนมัติ ไม่ต้องพิมพ์เอง",
        status: "in_progress",
        plannedQuarter: "Q2 2026",
      },
      {
        id: "s-filter",
        icon: "⚡",
        title: "Filter ขั้นสูง",
        description: "กรองตามพันธุ์, สี, และระยะทางจากตำแหน่งของคุณ",
        status: "locked",
        plannedQuarter: "Q3 2026",
        donationGoal: 3000,
      },
      {
        id: "s-report",
        icon: "🚩",
        title: "Report โพสต์ไม่เหมาะสม",
        description: "ระบบรายงานโพสต์ที่ผิดกฎเกณฑ์",
        status: "locked",
        plannedQuarter: "Q3 2026",
        donationGoal: 4000,
      },
    ],
  },

  // ──── Tier 2: Sprout — ฿15,000 ────
  {
    id: "sprout",
    emoji: "🌿",
    title: "ระยะ Sprout",
    subtitle: "ต้นกล้าที่กำลังเติบโต",
    targetAmount: 15000,
    color: "secondary",
    gradientFrom: "#7ecec0",
    gradientTo: "#4a9e8e",
    features: [
      {
        id: "sp-notif",
        icon: "🔔",
        title: "Push Notification",
        description: "แจ้งเตือนเมื่อมีคนสนใจรับน้องของคุณ",
        status: "locked",
        plannedQuarter: "Q4 2026",
        donationGoal: 8000,
      },
      {
        id: "sp-profile",
        icon: "👤",
        title: "หน้า Profile เต็มรูปแบบ",
        description: "จัดการโพสต์, ประวัติการรับเลี้ยง, และสถิติส่วนตัว",
        status: "locked",
        plannedQuarter: "Q4 2026",
        donationGoal: 10000,
      },
      {
        id: "sp-og",
        icon: "🔗",
        title: "OG Tags / Share Card",
        description: "แชร์โพสต์น้องเป็น card สวยๆ บน Line / Facebook",
        status: "locked",
        plannedQuarter: "Q4 2026",
        donationGoal: 12000,
      },
    ],
  },

  // ──── Tier 3: Bloom — ฿30,000 ────
  {
    id: "bloom",
    emoji: "🌸",
    title: "ระยะ Bloom",
    subtitle: "บานสะพรั่ง เต็มไปด้วยชีวิต",
    targetAmount: 30000,
    color: "accent",
    gradientFrom: "#f9b4c2",
    gradientTo: "#d4818f",
    features: [
      {
        id: "bl-points",
        icon: "⭐",
        title: "ระบบคะแนน & ยศ",
        description:
          'สะสม point จากทุกกิจกรรม — ไต่ยศจาก "ผู้เริ่มต้น" → "ผู้พิทักษ์สัตว์"',
        status: "locked",
        plannedQuarter: "Q1 2027",
        donationGoal: 18000,
      },
      {
        id: "bl-leaderboard",
        icon: "🏆",
        title: "Leaderboard รายจังหวัด",
        description: "แข่งขันกันในระดับจังหวัด — จัดอันดับรายสัปดาห์/เดือน",
        status: "locked",
        plannedQuarter: "Q1 2027",
        donationGoal: 22000,
      },
      {
        id: "bl-impact",
        icon: "📊",
        title: "Impact Card",
        description: "สรุปผลกระทบของคุณ — share ลง social ได้ทันที",
        status: "locked",
        plannedQuarter: "Q2 2027",
        donationGoal: 25000,
      },
      {
        id: "bl-streak",
        icon: "🔥",
        title: "Streak & วันต่อเนื่อง",
        description: "ติดตามวันที่คุณช่วยเหลือสัตว์ต่อเนื่อง",
        status: "locked",
        plannedQuarter: "Q2 2027",
        donationGoal: 28000,
      },
    ],
  },

  // ──── Tier 4: Champion — ฿60,000 ────
  {
    id: "champion",
    emoji: "🦁",
    title: "ระยะ Champion",
    subtitle: "ผู้พิทักษ์สัตว์แห่งชุมชน",
    targetAmount: 60000,
    color: "primary",
    gradientFrom: "#f2845c",
    gradientTo: "#c8440c",
    features: [
      {
        id: "ch-donation",
        icon: "💳",
        title: "ระบบสนับสนุนในแอป",
        description:
          "สนับสนุนให้น้องโดยตรงผ่าน QR PromptPay / TrueMoney Wallet",
        status: "locked",
        plannedQuarter: "Q3 2027",
        donationGoal: 40000,
      },
      {
        id: "ch-pwa",
        icon: "📱",
        title: "PWA & Offline Mode",
        description: "ติดตั้งเป็น App บนมือถือ — ใช้ได้แม้ไม่มีเน็ต",
        status: "locked",
        plannedQuarter: "Q3 2027",
        donationGoal: 45000,
      },
      {
        id: "ch-admin",
        icon: "🛡️",
        title: "Admin Dashboard",
        description: "จัดการโพสต์, ดู reports, และสถิติระบบ",
        status: "locked",
        plannedQuarter: "Q4 2027",
        donationGoal: 50000,
      },
      {
        id: "ch-vet",
        icon: "🏥",
        title: "ไดเรกทอรี่คลินิก/หมอ",
        description: "ค้นหาคลินิกสัตว์ใกล้บ้านบนแผนที่",
        status: "locked",
        plannedQuarter: "Q4 2027",
        donationGoal: 55000,
      },
    ],
  },

  // ──── Tier 5: Legend — ฿100,000 ────
  {
    id: "legend",
    emoji: "👑",
    title: "ระยะ Legend",
    subtitle: "ตำนานแห่งการช่วยเหลือสัตว์",
    targetAmount: 100000,
    color: "secondary",
    gradientFrom: "#f9b4c2",
    gradientTo: "#7ecec0",
    features: [
      {
        id: "lg-ai",
        icon: "🤖",
        title: "AI จดจำน้อง",
        description: "ค้นหาน้องด้วยรูปภาพ — AI บอกชนิด สายพันธุ์ ได้เลย",
        status: "locked",
        plannedQuarter: "Q2 2028",
        donationGoal: 70000,
      },
      {
        id: "lg-realtime",
        icon: "⚡",
        title: "Real-time Map",
        description: "แผนที่อัพเดทแบบ live — เห็น pin ใหม่ทันที",
        status: "locked",
        plannedQuarter: "Q2 2028",
        donationGoal: 80000,
      },
      {
        id: "lg-multilang",
        icon: "🌍",
        title: "Multi-language",
        description: "รองรับ EN / TH — เปิดรับอาสาสมัครทั่วโลก",
        status: "locked",
        plannedQuarter: "Q3 2028",
        donationGoal: 90000,
      },
      {
        id: "lg-api",
        icon: "🔌",
        title: "Open API",
        description: "เปิด API ให้หน่วยงานพันธมิตรและองค์กรสัตว์เชื่อมต่อ",
        status: "locked",
        plannedQuarter: "Q3 2028",
        donationGoal: 95000,
      },
    ],
  },
];

// ============================================================
// REPOSITORY IMPLEMENTATION
// ============================================================

export class SupabaseRoadMapRepository implements IRoadMapRepository {
  // ============================================================
  // CONSTRUCTOR
  // ============================================================
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  // ============================================================
  // PUBLIC METHODS
  // ============================================================

  async getTiers(): Promise<RoadMapTierData[]> {
    // Tier data is static editorial content
    return TIERS;
  }

  async getStats(): Promise<RoadMapStats> {
    try {
      // Query the roadmap_stats view
      const { data, error } = await this.supabase
        .from("roadmap_stats")
        .select("total_raised, unique_donors")
        .single();

      if (error) {
        console.error("Error fetching donation stats:", error);
        // Return zero stats if error
        return this.computeTierStats(0, 0);
      }

      const amount = data?.total_raised ? Number(data.total_raised) : 0;
      const donorCount = data?.unique_donors ? Number(data.unique_donors) : 0;

      return this.computeTierStats(amount, donorCount);
    } catch (error) {
      console.error("Error in getStats:", error);
      return this.computeTierStats(0, 0);
    }
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  private computeTierStats(amount: number, donorCount: number): RoadMapStats {
    let currentTier: RoadMapTier = "free";
    let nextTier: RoadMapTier | null = "seed";
    let progressPercent = 0;

    for (let i = 0; i < THRESHOLDS.length; i++) {
      const current = THRESHOLDS[i];
      const next = THRESHOLDS[i + 1];

      if (!next) {
        currentTier = current.tier;
        nextTier = null;
        progressPercent = 100;
        break;
      }

      if (amount >= current.amount && amount < next.amount) {
        currentTier = current.tier;
        nextTier = next.tier;
        const rangeSize = next.amount - current.amount;
        const progress = amount - current.amount;
        progressPercent = Math.round((progress / rangeSize) * 100);
        break;
      }

      if (amount >= next.amount) {
        continue;
      }
    }

    return {
      currentAmount: amount,
      donorCount,
      currentTier,
      nextTier,
      progressPercent,
    };
  }
}
