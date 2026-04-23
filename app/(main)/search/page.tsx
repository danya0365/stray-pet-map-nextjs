import { createBaseMetadata } from "@/config/metadata";
import { SearchView } from "@/presentation/components/search/SearchView";
import { createServerSearchPresenter } from "@/presentation/presenters/search/SearchPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

export function generateMetadata(): Metadata {
  return createBaseMetadata(
    "ค้นหาน้อง | รับเลี้ยงสัตว์จร",
    "ค้นหาสัตว์จรตามสถานะ ชนิด สายพันธุ์ สี หรือตำแหน่ง - หาบ้านให้หมาจร แมวจร",
    {
      url: "/search",
      keywords: ["ค้นหาสัตว์", "รับเลี้ยง", "หาบ้าน", "search", "filter"],
    },
  );
}

export default async function SearchPage() {
  const searchPresenter = await createServerSearchPresenter();

  let viewModel = null;
  let fetchError = false;

  try {
    viewModel = await searchPresenter.getViewModel();
  } catch (error) {
    console.error("Error fetching search data:", error);
    fetchError = true;
  }

  if (fetchError || !viewModel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="mb-4 text-foreground/60">ไม่สามารถโหลดข้อมูลได้</p>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SearchView initialViewModel={viewModel} petTypes={viewModel.petTypes} />
  );
}
