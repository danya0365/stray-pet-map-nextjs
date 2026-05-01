"use client";

import type { ActivityItem } from "@/domain/entities/activity";
import { useActivityFeedPresenter } from "@/presentation/presenters/activity-feed/useActivityFeedPresenter";
import { Loader2, RefreshCw, Zap } from "lucide-react";
import { ActivityCard } from "./ActivityCard";

const FILTERS = [
  { key: null, label: "ทั้งหมด" },
  { key: "new_post", label: "โพสต์ใหม่" },
  { key: "status_changed", label: "ตามหาเจอ" },
  { key: "new_comment", label: "คอมเมนต์" },
  { key: "badge_unlock", label: "Badge" },
];

interface ActivityFeedViewProps {
  initialItems?: ActivityItem[];
  initialHasMore?: boolean;
}

export function ActivityFeedView({
  initialItems,
  initialHasMore,
}: ActivityFeedViewProps) {
  const initialResult =
    initialItems !== undefined
      ? { items: initialItems, hasMore: initialHasMore ?? false }
      : undefined;

  const [state, actions] = useActivityFeedPresenter(initialResult);

  const { items, loading, loadingMore, error, hasMore, activeFilter } = state;
  const { loadMore, setFilter, refresh } = actions;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">อัปเดตล่าสุด</h1>
          <p className="text-sm text-foreground/50">
            ติดตามโพสต์และความคิดเห็นใหม่ๆ
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key ?? "all"}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.key || (!activeFilter && f.key === null)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground/60 hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <p>{error}</p>
          <button
            onClick={refresh}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            ลองใหม่
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && items.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-16 w-16 rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Zap className="h-6 w-6 text-foreground/40" />
          </div>
          <p className="text-sm text-foreground/60">ยังไม่มีกิจกรรมใหม่</p>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <ActivityCard key={item.id} activity={item} index={index} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="pt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังโหลด...</span>
              </>
            ) : (
              <span>โหลดเพิ่ม</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
