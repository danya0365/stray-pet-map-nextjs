"use client";

import { createClient } from "@/infrastructure/supabase/client";
import { SupabaseFavoriteRepository } from "@/infrastructure/repositories/supabase/SupabaseFavoriteRepository";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { cn } from "@/presentation/lib/cn";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface FavoriteButtonProps {
  petPostId: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  petPostId,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial state
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const repo = new SupabaseFavoriteRepository(supabase);

    repo.isFavorited(petPostId).then(setIsFav).catch(() => {});
  }, [user, petPostId]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setLoading(true);
      try {
        const supabase = createClient();
        const repo = new SupabaseFavoriteRepository(supabase);
        const newState = await repo.toggleFavorite(petPostId);
        setIsFav(newState);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [user, petPostId, router],
  );

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFav ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      className={cn(
        "rounded-full p-2 transition-all",
        isFav
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          : "text-foreground/30 hover:bg-foreground/5 hover:text-foreground/50",
        loading && "opacity-50",
        className,
      )}
    >
      <Heart
        className={cn(iconSize, isFav && "fill-current")}
      />
    </button>
  );
}
