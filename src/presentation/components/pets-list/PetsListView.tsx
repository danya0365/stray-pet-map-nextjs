"use client";

import { cn } from "@/presentation/lib/cn";
import { useSearchPresenter } from "@/presentation/presenters/search/useSearchPresenter";
import { Filter, Loader2, PawPrint } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { PetPostCard } from "../home/PetPostCard";

const STATUS_CHIPS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "available", label: "หาบ้าน" },
  { key: "missing", label: "ตามหา" },
  { key: "pending", label: "มีคนสนใจ" },
] as const;

interface PetsListViewProps {
  initialViewModel: import("@/presentation/presenters/search/SearchPresenter").SearchViewModel;
}

export function PetsListView({ initialViewModel }: PetsListViewProps) {
  const [state, actions] = useSearchPresenter(initialViewModel);
  const { viewModel, loading, loadingMore, error } = state;
  const { setFilters, loadMore, reset } = actions;

  const [activeStatus, setActiveStatus] = useState<string>("all");

  const handleStatusClick = useCallback(
    (status: string) => {
      setActiveStatus(status);
      if (status === "all") {
        setFilters({});
      } else {
        setFilters({ status: [status as "available" | "missing" | "pending"] });
      }
    },
    [setFilters],
  );

  const posts = viewModel?.result.data ?? [];
  const totalCount = viewModel?.result.total ?? 0;
  const hasMore = viewModel?.result.hasMore ?? false;
  const petTypes = viewModel?.petTypes ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          สัตว์หาบ้านทั้งหมด
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          {loading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              กำลังโหลด...
            </span>
          ) : (
            <>พบ {totalCount.toLocaleString()} รายการ</>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-foreground/50">
          <Filter className="h-3.5 w-3.5" />
          <span>กรอง:</span>
        </div>
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => handleStatusClick(chip.key)}
            disabled={loading}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeStatus === chip.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground/60 hover:bg-muted/80 hover:text-foreground/80",
              loading && "opacity-60 cursor-not-allowed",
            )}
          >
            {chip.label}
          </button>
        ))}

        {/* Pet type filter */}
        {petTypes.length > 0 && (
          <select
            disabled={loading}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                setFilters(
                  activeStatus === "all"
                    ? {}
                    : {
                        status: [
                          activeStatus as "available" | "missing" | "pending",
                        ],
                      },
                );
              } else {
                setFilters({
                  petTypeId: value,
                  ...(activeStatus !== "all" && {
                    status: [
                      activeStatus as "available" | "missing" | "pending",
                    ],
                  }),
                });
              }
            }}
            className={cn(
              "rounded-full border-0 bg-muted px-3 py-1 text-xs font-medium text-foreground/60 transition-colors focus:ring-1 focus:ring-primary",
              loading && "opacity-60",
            )}
          >
            <option value="all">ทุกชนิด</option>
            {petTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        )}

        {(activeStatus !== "all" || viewModel?.filters?.petTypeId) && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-xs text-primary hover:underline"
          >
            รีเซ็ต
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Grid */}
      {posts.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <PawPrint className="h-8 w-8 text-foreground/30" />
          </div>
          <h3 className="text-lg font-medium text-foreground/70">
            ไม่พบรายการ
          </h3>
          <p className="mt-1 text-sm text-foreground/50">
            ลองเปลี่ยนตัวกรอง หรือกลับไปดู{" "}
            <Link href="/" className="text-primary hover:underline">
              หน้าแรก
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <PetPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && posts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted",
              loadingMore && "opacity-60 cursor-not-allowed",
            )}
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
          </button>
        </div>
      )}
    </div>
  );
}
