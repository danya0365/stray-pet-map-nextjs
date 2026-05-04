export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type BadgeType =
  // Post-related badges
  | "first_post" // สร้างโพสต์แรก
  | "successful_adoption" // ช่วยหาบ้านให้สัตว์สำเร็จ
  | "pet_finder" // ช่วยตามหาสัตว์หายเจอเจ้าของ
  | "rescue_hero" // ช่วยเหลือสัตว์จรจัด (community cat)
  | "active_helper" // สร้างโพสต์ครบ 5 โพสต์
  | "super_helper" // สร้างโพสต์ครบ 20 โพสต์
  | "quick_responder" // ตอบรับคำขอรับเลี้ยงภายใน 24 ชม.
  | "verified_rescuer" // ยืนยันตัวตนและมีประวัติช่วยเหลือ
  // Comment-related badges
  | "first_comment" // คอมเมนต์ครั้งแรก
  | "active_commenter" // นักพูดคุยขยัน 50/200/500 คอมเมนต์
  | "helpful_responder" // ผู้ให้คำแนะนำ (20 replies received)
  | "community_connector" // นักเชื่อมโยง (avg reply depth >= 3)
  | "comment_streak" // ไม่มีวันหยุด (streak 7/30/100 วัน)
  | "liked_commenter"; // คนดังในชุมชน (100/500/2000 likes)

export interface Badge {
  id: string;
  profileId: string;
  type: BadgeType;
  tier: BadgeTier;
  name: string;
  description: string;
  icon: string; // Lucide icon name หรือ emoji
  color: string; // Semantic color key (e.g. "blue")
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
  {
    name: string;
    description: string;
    icon: string;
    color: string;
    tiers: BadgeTier[];
  }
> = {
  first_post: {
    name: "นักช่วยเหลือมือใหม่",
    description: "สร้างโพสต์ช่วยเหลือสัตว์ครั้งแรก",
    icon: "🌟",
    color: "amber",
    tiers: ["bronze"],
  },
  successful_adoption: {
    name: "ผู้ให้บ้านที่อบอุ่น",
    description: "ช่วยหาบ้านใหม่ให้สัตว์จรจัดสำเร็จ",
    icon: "🏠",
    color: "emerald",
    tiers: ["bronze", "silver", "gold", "platinum"],
  },
  pet_finder: {
    name: "นักสืบสัตว์เลี้ยง",
    description: "ช่วยตามหาสัตว์หายและเจอเจ้าของ",
    icon: "🔍",
    color: "blue",
    tiers: ["bronze", "silver", "gold"],
  },
  rescue_hero: {
    name: "ฮีโร่แมวจร",
    description: "ช่วยเหลือแมวจรจัดในชุมชน",
    icon: "🦸",
    color: "purple",
    tiers: ["bronze", "silver", "gold"],
  },
  active_helper: {
    name: "นักช่วยเหลือขยัน",
    description: "สร้างโพสต์ช่วยเหลือครบ 5 โพสต์",
    icon: "⚡",
    color: "orange",
    tiers: ["silver"],
  },
  super_helper: {
    name: "ซูเปอร์ฮีโร่สัตว์",
    description: "สร้างโพสต์ช่วยเหลือครบ 20 โพสต์",
    icon: "🦸‍♂️",
    color: "red",
    tiers: ["gold"],
  },
  quick_responder: {
    name: "สายฟ้า",
    description: "ตอบรับคำขอรับเลี้ยงภายใน 24 ชั่วโมง",
    icon: "⚡",
    color: "yellow",
    tiers: ["silver"],
  },
  verified_rescuer: {
    name: "นักช่วยเหลือที่ได้รับการยืนยัน",
    description: "ยืนยันตัวตนและมีประวัติช่วยเหลือที่ดี",
    icon: "✓",
    color: "teal",
    tiers: ["platinum"],
  },
  // Comment badges
  first_comment: {
    name: "เสียงแรก",
    description: "คอมเมนต์ครั้งแรกในชุมชน",
    icon: "💬",
    color: "blue",
    tiers: ["bronze"],
  },
  active_commenter: {
    name: "นักพูดคุยขยัน",
    description: "คอมเมนต์ครบ 50/200/500 ครั้ง",
    icon: "💬",
    color: "indigo",
    tiers: ["bronze", "silver", "gold"],
  },
  helpful_responder: {
    name: "ผู้ให้คำแนะนำ",
    description: "มีคน reply คอมเมนต์ของคุณ 20 ครั้ง",
    icon: "🤝",
    color: "emerald",
    tiers: ["silver"],
  },
  community_connector: {
    name: "นักเชื่อมโยง",
    description: "สร้างการสนทนาที่มีส่วนร่วมลึกซึ้ง",
    icon: "🔗",
    color: "purple",
    tiers: ["gold"],
  },
  comment_streak: {
    name: "ไม่มีวันหยุด",
    description: "คอมเมนต์ต่อเนื่อง 7/30/100 วัน",
    icon: "🔥",
    color: "orange",
    tiers: ["silver", "gold", "platinum"],
  },
  liked_commenter: {
    name: "คนดังในชุมชน",
    description: "ได้รับ 100/500/2000 likes จากคอมเมนต์",
    icon: "❤️",
    color: "pink",
    tiers: ["bronze", "silver", "gold"],
  },
};

// Tier requirements
export const TIER_REQUIREMENTS: Record<BadgeType, Record<BadgeTier, number>> = {
  first_post: { bronze: 1, silver: 0, gold: 0, platinum: 0 },
  successful_adoption: { bronze: 1, silver: 3, gold: 10, platinum: 30 },
  pet_finder: { bronze: 1, silver: 5, gold: 15, platinum: 0 },
  rescue_hero: { bronze: 3, silver: 10, gold: 25, platinum: 0 },
  active_helper: { bronze: 0, silver: 5, gold: 0, platinum: 0 },
  super_helper: { bronze: 0, silver: 0, gold: 20, platinum: 0 },
  quick_responder: { bronze: 0, silver: 10, gold: 0, platinum: 0 },
  verified_rescuer: { bronze: 0, silver: 0, gold: 0, platinum: 1 },
  // Comment tier requirements
  first_comment: { bronze: 1, silver: 0, gold: 0, platinum: 0 },
  active_commenter: { bronze: 50, silver: 200, gold: 500, platinum: 0 },
  helpful_responder: { bronze: 0, silver: 20, gold: 0, platinum: 0 },
  community_connector: { bronze: 0, silver: 0, gold: 1, platinum: 0 }, // 1 = has avg depth >= 3
  comment_streak: { bronze: 0, silver: 7, gold: 30, platinum: 100 },
  liked_commenter: { bronze: 100, silver: 500, gold: 2000, platinum: 0 },
};
