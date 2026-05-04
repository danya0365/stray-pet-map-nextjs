import { ActivityFeedView } from "@/presentation/components/activity-feed/ActivityFeedView";
import { createServerActivityFeedPresenter } from "@/presentation/presenters/activity-feed/ActivityFeedPresenterServerFactory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "อัปเดตล่าสุดจากชุมชน | StrayPetMap",
  description:
    "ติดตามโพสต์ใหม่ น้องที่หาบ้านเจอ ความคิดเห็น และอัปเดตสำคัญจากชุมชน StrayPetMap — ร่วมช่วยเหลือสัตว์เลี้ยงไร้บ้านไปด้วยกัน",
  openGraph: {
    title: "อัปเดตล่าสุดจากชุมชน StrayPetMap",
    description:
      "ติดตามโพสต์ใหม่ น้องที่หาบ้านเจอ ความคิดเห็น และอัปเดตสำคัญจากชุมชน",
    type: "website",
    locale: "th_TH",
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "StrayPetMap Community Updates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "อัปเดตล่าสุดจากชุมชน StrayPetMap",
    description:
      "ติดตามโพสต์ใหม่ น้องที่หาบ้านเจอ ความคิดเห็น และอัปเดตสำคัญจากชุมชน",
    images: ["/images/og-default.svg"],
  },
};

export default async function UpdatesPage() {
  const presenter = await createServerActivityFeedPresenter();
  const result = await presenter.getFeed({ limit: 20 });

  const initialItems = result.success && result.data ? result.data.items : [];
  const initialHasMore =
    result.success && result.data ? result.data.hasMore : false;

  return (
    <main className="min-h-screen pt-4">
      <ActivityFeedView
        initialItems={initialItems}
        initialHasMore={initialHasMore}
      />
    </main>
  );
}
