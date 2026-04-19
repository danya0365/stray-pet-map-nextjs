"use client";

import { PetPostCard } from "@/presentation/components/home/PetPostCard";
import { useFavoritePresenter } from "@/presentation/presenters/favorite/useFavoritePresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { ChevronDown, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export function FavoritesList() {
  const { isLoading: authLoading } = useAuthStore();
  const [state, actions] = useFavoritePresenter();

  const { posts, totalCount, hasMore, loading, loadingMore, error } =
    state.favorites;
  const { loadMore, refreshFavorites } = actions;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="mb-4 h-12 w-12 text-red-300" />
        <h3 className="text-lg font-semibold text-foreground/60">
          เกิดข้อผิดพลาด
        </h3>
        <p className="mt-1 text-sm text-foreground/40">{error}</p>
        <button
          onClick={refreshFavorites}
          className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="mb-4 h-12 w-12 text-foreground/15" />
        <h3 className="text-lg font-semibold text-foreground/60">
          ยังไม่มีรายการโปรด
        </h3>
        <p className="mt-1 text-sm text-foreground/40">
          กดหัวใจ ❤️ ที่การ์ดน้องเพื่อเพิ่มในรายการโปรด
        </p>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          ดูน้องทั้งหมด
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {posts.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <Heart className="h-4 w-4" />
          <span>{totalCount} รายการโปรด</span>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PetPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4">
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
              <>
                <ChevronDown className="h-4 w-4" />
                <span>โหลดเพิ่ม ({totalCount - posts.length} รายการ)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
