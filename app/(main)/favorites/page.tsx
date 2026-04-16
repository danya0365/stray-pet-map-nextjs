import { FavoritesList } from "@/presentation/components/favorites/FavoritesList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "รายการโปรด | StrayPetMap",
  description: "น้องที่คุณบันทึกไว้ในรายการโปรด",
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">รายการโปรด</h1>
      <FavoritesList />
    </div>
  );
}
