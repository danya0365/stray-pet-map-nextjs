"use client";

import { cn } from "@/presentation/lib/cn";
import { useFavoriteButton } from "@/presentation/presenters/favorites/useFavoritePresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

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
  const { isFavorited, loading, toggle } = useFavoriteButton(petPostId);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        await toggle();
      } catch {
        // silently fail
      }
    },
    [user, toggle, router],
  );

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={isFavorited ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      className={cn(
        "rounded-full p-2 transition-all",
        isFavorited
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
          : "text-foreground/30 hover:bg-foreground/5 hover:text-foreground/50",
        loading && "opacity-50",
        className,
      )}
    >
      <Heart className={cn(iconSize, isFavorited && "fill-current")} />
    </button>
  );
}
