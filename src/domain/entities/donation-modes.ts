/**
 * Donation Mode Configuration
 * Single source of truth for donation target type metadata
 */

import type { DonationTargetType } from "./donation";
import type { LucideIcon } from "lucide-react";
import { Building2, Heart, PawPrint } from "lucide-react";

export interface DonationModeConfig {
  targetType: DonationTargetType;
  icon: LucideIcon;
  label: string;
  sublabel: string;
  headerTitle: string;
  headerSubtitle: string;
  submitButtonText: string;
}

export const DONATION_MODE_CONFIG: Record<
  DonationTargetType,
  DonationModeConfig
> = {
  dev: {
    targetType: "dev",
    icon: Heart,
    label: "กำลังใจ Dev",
    sublabel: "ให้ทีมพัฒนา",
    headerTitle: "ให้กำลังใจทีมงาน",
    headerSubtitle: "ขอบคุณที่ให้กำลังใจพวกเรา",
    submitButtonText: "ให้กำลังใจ",
  },
  fund: {
    targetType: "fund",
    icon: Building2,
    label: "แพลตฟอร์ม",
    sublabel: "พัฒนาต่อ",
    headerTitle: "สนับสนุน StrayPetMap",
    headerSubtitle: "ช่วยเราพัฒนาแพลตฟอร์มต่อไป",
    submitButtonText: "สนับสนุน",
  },
  pet: {
    targetType: "pet",
    icon: PawPrint,
    label: "ผู้ดูแลน้อง",
    sublabel: "ส่งต่อผู้ดูแล",
    headerTitle: "ให้ผู้ดูแลน้อง",
    headerSubtitle: "ส่งต่อให้ผู้ดูแลน้องโดยตรง",
    submitButtonText: "ส่งต่อให้ผู้ดูแล",
  },
};

/** Preset donation amounts (shared across all donation views) */
export const DONATION_PRESETS = [
  { value: 50, label: "50฿" },
  { value: 100, label: "100฿" },
  { value: 200, label: "200฿" },
  { value: 500, label: "500฿" },
] as const;

/** Active style class for mode selector buttons */
export const MODE_ACTIVE_CLASS =
  "border-primary bg-primary/10 text-primary";

/** Inactive style class for mode selector buttons */
export const MODE_INACTIVE_CLASS =
  "border-border bg-muted/30 hover:border-primary/30";
