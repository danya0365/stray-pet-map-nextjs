import { createServerActivityFeedPresenter } from "@/presentation/presenters/activity-feed/ActivityFeedPresenterServerFactory";
import { ActivityFeedView } from "@/presentation/components/activity-feed/ActivityFeedView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "อัปเดตล่าสุด | StrayPetMap",
  description: "ติดตามโพสต์ใหม่และความคิดเห็นล่าสุดจากชุมชน StrayPetMap",
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
