"use client";

import { PetPostCard } from "@/presentation/components/home/PetPostCard";
import { useFavoritePresenter } from "@/presentation/presenters/favorites/useFavoritePresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export function FavoritesList() {
  const { isLoading: authLoading } = useAuthStore();
  const [{ viewModel, loading }] = useFavoritePresenter();

  const posts = viewModel?.posts ?? [];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PetPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
