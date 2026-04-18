import { BadgeLeaderboardContainer } from "@/presentation/components/badges/BadgeLeaderboardContainer";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Hall of Fame - นักช่วยเหลือสัตว์ยอดเยี่ยม",
  description: "ตารางคะแนนผู้ใช้ที่มีตราสัญลักษณ์การช่วยเหลือสัตว์มากที่สุด",
};

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
