import { createBaseMetadata } from "@/config/metadata";
import { FavoritesList } from "@/presentation/components/favorites/FavoritesList";
import type { Metadata } from "next";

export const metadata: Metadata = createBaseMetadata(
  "รายการโปรด | น้องที่คุณบันทึกไว้",
  "ดูรายการน้องที่คุณบันทึกไว้ในรายการโปรด - สัตว์จรที่คุณสนใจรับเลี้ยงหรือติดตาม",
  {
    url: "/favorites",
    keywords: ["รายการโปรด", "บันทึก", "favorites", "bookmark"],
  },
);

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">รายการโปรด</h1>
      <FavoritesList />
    </div>
  );
}
