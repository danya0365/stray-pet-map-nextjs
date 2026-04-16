export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type BadgeType =
  | "first_post" // สร้างโพสต์แรก
  | "successful_adoption" // ช่วยหาบ้านให้สัตว์สำเร็จ
  | "pet_finder" // ช่วยตามหาสัตว์หายเจอเจ้าของ
  | "rescue_hero" // ช่วยเหลือสัตว์จรจัด (community cat)
  | "active_helper" // สร้างโพสต์ครบ 5 โพสต์
  | "super_helper" // สร้างโพสต์ครบ 20 โพสต์
  | "quick_responder" // ตอบรับคำขอรับเลี้ยงภายใน 24 ชม.
  | "verified_rescuer"; // ยืนยันตัวตนและมีประวัติช่วยเหลือ

export interface Badge {
  id: string;
  profileId: string;
  type: BadgeType;
  tier: BadgeTier;
  name: string;
  description: string;
  icon: string; // Lucide icon name หรือ emoji
  color: string; // Tailwind color class
  awardedAt: string;
  earnedValue?: number; // ค่าที่ทำให้ได้รับ badge (เช่น จำนวนโพสต์)
}

export interface BadgeProgress {
  type: BadgeType;
  current: number;
  target: number;
  percentage: number;
  nextTier?: BadgeTier;
}

export interface ProfileWithBadges {
  profileId: string;
  displayName: string;
  avatarUrl?: string;
  badges: Badge[];
  totalBadges: number;
  recentBadges: Badge[];
  progress: BadgeProgress[];
}

// Badge ค่าเริ่มต้น
export const BADGE_DEFINITIONS: Record<
  BadgeType,
  { name: string; description: string; icon: string; color: string; tiers: BadgeTier[] }
> = {
  first_post: {
    name: "นักช่วยเหลือมือใหม่",
    description: "สร้างโพสต์ช่วยเหลือสัตว์ครั้งแรก",
    icon: "🌟",
    color: "bg-amber-100 text-amber-700",
    tiers: ["bronze"],
  },
  successful_adoption: {
    name: "ผู้ให้บ้านที่อบอุ่น",
    description: "ช่วยหาบ้านใหม่ให้สัตว์จรจัดสำเร็จ",
    icon: "🏠",
    color: "bg-emerald-100 text-emerald-700",
    tiers: ["bronze", "silver", "gold", "platinum"],
  },
  pet_finder: {
    name: "นักสืบสัตว์เลี้ยง",
    description: "ช่วยตามหาสัตว์หายและเจอเจ้าของ",
    icon: "🔍",
    color: "bg-blue-100 text-blue-700",
    tiers: ["bronze", "silver", "gold"],
  },
  rescue_hero: {
    name: "ฮีโร่แมวจร",
    description: "ช่วยเหลือแมวจรจัดในชุมชน",
    icon: "🦸",
    color: "bg-purple-100 text-purple-700",
    tiers: ["bronze", "silver", "gold"],
  },
  active_helper: {
    name: "นักช่วยเหลือขยัน",
    description: "สร้างโพสต์ช่วยเหลือครบ 5 โพสต์",
    icon: "⚡",
    color: "bg-orange-100 text-orange-700",
    tiers: ["silver"],
  },
  super_helper: {
    name: "ซูเปอร์ฮีโร่สัตว์",
    description: "สร้างโพสต์ช่วยเหลือครบ 20 โพสต์",
    icon: "🦸‍♂️",
    color: "bg-red-100 text-red-700",
    tiers: ["gold"],
  },
  quick_responder: {
    name: "สายฟ้า",
    description: "ตอบรับคำขอรับเลี้ยงภายใน 24 ชั่วโมง",
    icon: "⚡",
    color: "bg-yellow-100 text-yellow-700",
    tiers: ["silver"],
  },
  verified_rescuer: {
    name: "นักช่วยเหลือที่ได้รับการยืนยัน",
    description: "ยืนยันตัวตนและมีประวัติช่วยเหลือที่ดี",
    icon: "✓",
    color: "bg-teal-100 text-teal-700",
    tiers: ["platinum"],
  },
};

// Tier requirements
export const TIER_REQUIREMENTS: Record<
  BadgeType,
  Record<BadgeTier, number>
> = {
  first_post: { bronze: 1, silver: 0, gold: 0, platinum: 0 },
  successful_adoption: { bronze: 1, silver: 3, gold: 10, platinum: 30 },
  pet_finder: { bronze: 1, silver: 5, gold: 15, platinum: 0 },
  rescue_hero: { bronze: 3, silver: 10, gold: 25, platinum: 0 },
  active_helper: { bronze: 0, silver: 5, gold: 0, platinum: 0 },
  super_helper: { bronze: 0, silver: 0, gold: 20, platinum: 0 },
  quick_responder: { bronze: 0, silver: 10, gold: 0, platinum: 0 },
  verified_rescuer: { bronze: 0, silver: 0, gold: 0, platinum: 1 },
};
