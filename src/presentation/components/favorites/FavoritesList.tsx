"use client";

import type { PetPost } from "@/domain/entities/pet-post";
import { SupabaseFavoriteRepository } from "@/infrastructure/repositories/supabase/SupabaseFavoriteRepository";
import { SupabasePetPostRepository } from "@/infrastructure/repositories/supabase/SupabasePetPostRepository";
import { createClient } from "@/infrastructure/supabase/client";
import { PetPostCard } from "@/presentation/components/home/PetPostCard";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FavoritesList() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    const load = async () => {
      const supabase = createClient();
      const favRepo = new SupabaseFavoriteRepository(supabase);
      const postRepo = new SupabasePetPostRepository(supabase);

      const postIds = await favRepo.getFavoritePostIds();
      if (cancelled) return;

      if (postIds.length === 0) {
        setPosts([]);
        setDataLoading(false);
        return;
      }

      const results = await Promise.all(
        postIds.map((id) => postRepo.getById(id)),
      );
      if (cancelled) return;
      setPosts(results.filter((p): p is PetPost => p !== null));
      setDataLoading(false);
    };

    load().catch(() => {
      if (!cancelled) setDataLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const loading = authLoading || (user && dataLoading);

  if (loading) {
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
