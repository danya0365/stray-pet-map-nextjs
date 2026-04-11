"use client";

import { PetPostCard } from "@/presentation/components/home/PetPostCard";
import type { SearchViewModel } from "@/presentation/presenters/search/SearchPresenter";
import { useSearchPresenter } from "@/presentation/presenters/search/useSearchPresenter";
import { Loader2 } from "lucide-react";
import { NearBySection } from "./NearBySection";
import { SearchFilterBar } from "./SearchFilterBar";

interface SearchViewProps {
  initialViewModel?: SearchViewModel;
}

export function SearchView({ initialViewModel }: SearchViewProps) {
  const [state, actions] = useSearchPresenter(initialViewModel);
  const { viewModel, loading, loadingMore, error, nearBy } = state;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">ค้นหาสัตว์</h1>

      {/* Filter Bar */}
      <SearchFilterBar
        filters={viewModel?.filters || {}}
        search={viewModel?.search || ""}
        onSearchChange={actions.search}
        onFiltersChange={actions.setFilters}
        resultCount={viewModel?.result.total}
      />

      {/* Near By */}
      <div className="mt-4">
        <NearBySection nearBy={nearBy} onChange={actions.setNearBy} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {viewModel && !loading && (
        <>
          {viewModel.result.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-4xl">🐾</p>
              <p className="mt-3 text-sm font-medium text-foreground/60">
                ไม่พบน้องที่ตรงกับเงื่อนไข
              </p>
              <button
                onClick={actions.reset}
                className="mt-2 text-sm text-primary hover:underline"
                type="button"
              >
                ล้างตัวกรอง
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {viewModel.result.data.map((post) => (
                  <PetPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Load More */}
              {viewModel.result.hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={actions.loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted disabled:opacity-50"
                    type="button"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        กำลังโหลด...
                      </>
                    ) : (
                      "โหลดเพิ่มเติม"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
