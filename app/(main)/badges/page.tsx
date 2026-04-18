import { createBaseMetadata } from "@/config/metadata";
import { BadgeLeaderboardContainer } from "@/presentation/components/badges/BadgeLeaderboardContainer";
import { Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = createBaseMetadata(
  "Hall of Fame | นักช่วยเหลือสัตว์ยอดเยี่ยม",
  "ตารางคะแนนผู้ใช้ที่มีตราสัญลักษณ์การช่วยเหลือสัตว์มากที่สุด - ผู้ใจบุญและฮีโร่สี่ขาของเรา",
  {
    url: "/badges",
    keywords: [
      "Hall of Fame",
      "ตารางคะแนน",
      "นักช่วยเหลือ",
      "leaderboard",
      "badges",
    ],
  },
);

export default function BadgesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
        <Trophy className="h-8 w-8 text-primary" />
        Hall of Fame
      </h1>

      <BadgeLeaderboardContainer />
    </div>
  );
}
