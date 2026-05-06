import { createBaseMetadata } from "@/config/metadata";
import { PetsListView } from "@/presentation/components/pets-list/PetsListView";
import { createServerSearchPresenter } from "@/presentation/presenters/search/SearchPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = createBaseMetadata(
  "สัตว์หาบ้านทั้งหมด | StrayPetMap",
  "ดูสัตว์จรทั้งหมดที่กำลังหาบ้าน ตามหาเจ้าของ หรือมีคนสนใจรับเลี้ยง",
  {
    url: "/pets",
    keywords: ["สัตว์หาบ้าน", "รับเลี้ยง", " pets", "adoption"],
  },
);

export default async function PetsPage() {
  const presenter = await createServerSearchPresenter();

  let initialViewModel = null;
  let fetchError = false;

  try {
    initialViewModel = await presenter.getViewModel({
      filters: {},
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      perPage: 24,
    });
  } catch (error) {
    console.error("Error fetching pets list:", error);
    fetchError = true;
  }

  if (fetchError || !initialViewModel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="mb-4 text-foreground/60">
            ไม่สามารถโหลดรายการสัตว์ได้
          </p>
          <Link
            href="/pets"
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            ลองใหม่อีกครั้ง
          </Link>
        </div>
      </div>
    );
  }

  return <PetsListView initialViewModel={initialViewModel} />;
}
