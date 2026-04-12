import { MapView } from "@/presentation/components/map/MapView";
import { createServerMapPresenter } from "@/presentation/presenters/map/MapPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "แผนที่น้อง | StrayPetMap",
    description: "ดูตำแหน่งสัตว์จรบนแผนที่",
  };
}

export default async function MapPage() {
  const presenter = await createServerMapPresenter();
  let viewModel = null;
  let fetchError = false;

  try {
    viewModel = await presenter.getViewModel();
  } catch (error) {
    console.error("Error fetching map data:", error);
    fetchError = true;
  }

  if (fetchError || !viewModel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="mb-4 text-foreground/60">
            ไม่สามารถโหลดข้อมูลแผนที่ได้
          </p>
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

  return <MapView initialViewModel={viewModel} />;
}
