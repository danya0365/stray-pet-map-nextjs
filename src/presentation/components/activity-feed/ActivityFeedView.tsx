"use client";

import type { ActivityItem } from "@/domain/entities/activity";
import { useActivityFeedPresenter } from "@/presentation/presenters/activity-feed/useActivityFeedPresenter";
import {
  Heart,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  PenSquare,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivityCard } from "./ActivityCard";

const FILTERS = [
  { key: null, label: "ทั้งหมด", icon: Zap },
  { key: "new_post", label: "โพสต์ใหม่", icon: Sparkles },
  { key: "status_changed", label: "ตามหาเจอ", icon: Trophy },
  { key: "new_comment", label: "คอมเมนต์", icon: MessageCircle },
  { key: "badge_unlock", label: "Badge", icon: Trophy },
  { key: "post_expiring_soon", label: "ใกล้หมด", icon: Zap },
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
  const [searchQuery, setSearchQuery] = useState("");

  const { items, loading, loadingMore, error, hasMore, activeFilter } = state;
  const { loadMore, setFilter, refresh } = actions;

  // Client-side search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.actor.displayName.toLowerCase().includes(q) ||
        (item.payload.postTitle?.toLowerCase().includes(q) ?? false) ||
        (item.payload.commentContent?.toLowerCase().includes(q) ?? false),
    );
  }, [items, searchQuery]);

  // Simple stats from visible items
  const stats = useMemo(() => {
    const posts = items.filter((i) => i.type === "new_post").length;
    const found = items.filter(
      (i) =>
        i.type === "status_changed" &&
        (i.payload.postOutcome === "owner_found" ||
          i.payload.postOutcome === "rehomed"),
    ).length;
    const comments = items.filter(
      (i) => i.type === "new_comment" || i.type === "comment_reply",
    ).length;
    return { posts, found, comments };
  }, [items]);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="mx-auto flex max-w-7xl">
        {/* Left Sidebar */}
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-20 flex-col gap-2 px-2 py-4 lg:flex lg:w-64 xl:w-72">
          {/* Navigation */}
          <nav className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              <span className="hidden text-sm font-medium lg:inline">
                หน้าหลัก
              </span>
            </Link>
            <Link
              href="/updates"
              className="flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-3 font-semibold text-primary transition-colors"
            >
              <Zap className="h-5 w-5" />
              <span className="hidden text-sm lg:inline">อัปเดตล่าสุด</span>
            </Link>
            <Link
              href="/pets"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            >
              <MapPin className="h-5 w-5" />
              <span className="hidden text-sm font-medium lg:inline">
                สัตว์เลี้ยง
              </span>
            </Link>
            <Link
              href="/donate"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            >
              <Heart className="h-5 w-5" />
              <span className="hidden text-sm font-medium lg:inline">
                สนับสนุน
              </span>
            </Link>
          </nav>

          {/* Create Post CTA */}
          <div className="mt-4 px-1">
            <Link
              href="/posts/create"
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              <PenSquare className="h-4 w-4" />
              <span className="hidden lg:inline">โพสต์ใหม่</span>
            </Link>
          </div>

          {/* Filter Categories */}
          <div className="mt-6 space-y-1">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              หมวดหมู่
            </p>
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const isActive =
                activeFilter === f.key || (!activeFilter && f.key === null);
              return (
                <button
                  key={f.key ?? "all"}
                  onClick={() => setFilter(f.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-auto rounded-xl border border-border bg-muted/20 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              สถิติวันนี้
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">โพสต์ใหม่</span>
                <span className="font-semibold">{stats.posts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">เจอเจ้าของ</span>
                <span className="font-semibold text-green-600">
                  {stats.found}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">คอมเมนต์</span>
                <span className="font-semibold">{stats.comments}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="min-w-0 flex-1 border-x border-border">
          {/* Sticky Header */}
          <div className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">อัปเดตล่าสุด</h2>
              <button
                onClick={refresh}
                disabled={loading}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
            <div className="space-y-0 divide-y divide-border/60">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <div className="h-3 w-24 rounded bg-muted" />
                        <div className="h-3 w-16 rounded bg-muted" />
                      </div>
                      <div className="h-3 w-full rounded bg-muted" />
                      <div className="h-3 w-3/4 rounded bg-muted" />
                      <div className="h-32 w-full rounded-xl bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredItems.length === 0 && !error && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Zap className="h-6 w-6 text-foreground/40" />
              </div>
              <p className="text-sm text-foreground/60">ยังไม่มีกิจกรรมใหม่</p>
            </div>
          )}

          {/* Feed */}
          <div className="divide-y divide-border/60">
            {filteredItems.map((item, index) => (
              <ActivityCard key={item.id} activity={item} index={index} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="px-4 pt-4 pb-6">
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
        </main>

        {/* Right Sidebar */}
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-80 flex-col gap-4 overflow-y-auto px-4 py-4 xl:flex">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาใน feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
            />
          </div>

          {/* Community Stats Card */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="mb-3 text-sm font-bold">ชุมชน StrayPetMap</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background p-2">
                <div className="text-lg font-bold text-primary">
                  {stats.posts}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  โพสต์ใหม่
                </div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="text-lg font-bold text-green-600">
                  {stats.found}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  เจอเจ้าของ
                </div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="text-lg font-bold">{stats.comments}</div>
                <div className="text-[10px] text-muted-foreground">
                  คอมเมนต์
                </div>
              </div>
            </div>
          </div>

          {/* Trending / Highlights */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="mb-3 text-sm font-bold">ไฮไลท์</h3>
            <div className="space-y-3">
              {items
                .filter(
                  (i) =>
                    i.type === "status_changed" &&
                    (i.payload.postOutcome === "owner_found" ||
                      i.payload.postOutcome === "rehomed"),
                )
                .slice(0, 3)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/pets/${item.payload.postId}`}
                    className="group flex items-start gap-2"
                  >
                    <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium leading-snug group-hover:text-primary">
                        {item.payload.postTitle ?? "โพสต์ใหม่"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.payload.postOutcome === "owner_found"
                          ? "เจอเจ้าของแล้ว 🎉"
                          : "มีบ้านใหม่แล้ว 🏠"}
                      </p>
                    </div>
                  </Link>
                ))}
              {items.filter(
                (i) =>
                  i.type === "status_changed" &&
                  (i.payload.postOutcome === "owner_found" ||
                    i.payload.postOutcome === "rehomed"),
              ).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  ยังไม่มีข่าวดีในช่วงนี้
                </p>
              )}
            </div>
          </div>

          {/* Trending Tags / Quick Links */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <h3 className="mb-3 text-sm font-bold">ลิงก์ด่วน</h3>
            <div className="space-y-1">
              <Link
                href="/donate/leaderboard"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                กระดานผู้สนับสนุน
              </Link>
              <Link
                href="/road-map"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                แผนพัฒนา
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
