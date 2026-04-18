import { createBaseMetadata } from "@/config/metadata";
import { RoadMapView } from "@/presentation/components/road-map/RoadMapView";
import { createServerRoadMapPresenter } from "@/presentation/presenters/road-map/RoadMapPresenterServerFactory";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function generateMetadata(): Metadata {
  return createBaseMetadata(
    "Road Map | แผนพัฒนาและยอดบริจาค",
    "ดูแผนการพัฒนาฟีเจอร์ต่อไปของ StrayPetMap และยอดบริจาคสะสม - ร่วมสนับสนุนการช่วยเหลือสัตว์",
    {
      url: "/road-map",
      keywords: ["Road Map", "แผนพัฒนา", "บริจาค", "donation", "roadmap"],
    },
  );
}

/**
 * Road Map page — Server Component for SEO optimization
 * แสดงแผนการพัฒนาฟีเจอร์ ตามยอดสนับสนุนที่สะสม
 */
export default async function RoadMapPage() {
  const presenter = await createServerRoadMapPresenter();

  try {
    const viewModel = await presenter.getViewModel();
    return <RoadMapView initialViewModel={viewModel} />;
  } catch (error) {
    console.error("Error fetching road-map data:", error);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            เกิดข้อผิดพลาด
          </h1>
          <p className="mb-4 text-foreground/60">
            ไม่สามารถโหลด Road Map ได้ในขณะนี้
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }
}
