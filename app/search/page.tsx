import { SearchView } from "@/presentation/components/search/SearchView";
import { createServerSearchPresenter } from "@/presentation/presenters/search/SearchPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

export function generateMetadata(): Metadata {
  return {
    title: "ค้นหาน้อง | StrayPetMap",
    description: "ค้นหาสัตว์จรตามสถานะ ชนิด หรือตำแหน่ง",
  };
}

export default async function SearchPage() {
  const presenter = await createServerSearchPresenter();
  let viewModel = null;
  let fetchError = false;

  try {
    viewModel = await presenter.getViewModel();
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

  return <SearchView initialViewModel={viewModel} />;
}
