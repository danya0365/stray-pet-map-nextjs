"use client";

import { cn } from "@/presentation/lib/cn";
import { usePetPostLikePresenter } from "@/presentation/presenters/pet-post-like/usePetPostLikePresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface PetPostLikeButtonProps {
  petPostId: string;
  initialCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
  showCount?: boolean;
}

export function PetPostLikeButton({
  petPostId,
  initialCount,
  className,
  size = "md",
  variant = "default",
  showCount = true,
}: PetPostLikeButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [
    { isLiked, likeCount, loading },
    { toggle },
  ] = usePetPostLikePresenter(petPostId);

  const displayCount = initialCount !== undefined && likeCount === 0 && !isLiked
    ? initialCount
    : likeCount;

  const handleToggle = useCallback(async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!loading) {
      await toggle();
    }
  }, [user, loading, toggle, router]);

  const sizeClasses = {
    sm: "h-7 gap-1 px-2 text-xs",
    md: "h-9 gap-1.5 px-3 text-sm",
    lg: "h-11 gap-2 px-4 text-base",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantClasses = {
    default: cn(
      "rounded-full transition-all",
      isLiked
        ? "bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30"
        : "bg-muted text-foreground/50 hover:bg-muted/80 hover:text-foreground/70",
    ),
    ghost: cn(
      "rounded-full transition-all",
      isLiked
        ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
        : "text-foreground/40 hover:bg-muted hover:text-foreground/60",
    ),
    outline: cn(
      "rounded-full border transition-all",
      isLiked
        ? "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/20"
        : "border-border bg-card text-foreground/50 hover:border-foreground/20 hover:text-foreground/70",
    ),
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={isLiked ? "เลิกถูกใจ" : "ถูกใจ"}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        sizeClasses[size],
        variantClasses[variant],
        loading && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          isLiked && "fill-current",
          "transition-transform active:scale-90",
        )}
      />
      {showCount && (
        <span className={cn("tabular-nums", isLiked && "text-rose-600")}>
          {displayCount > 0 ? displayCount.toLocaleString() : "ถูกใจ"}
        </span>
      )}
    </button>
  );
}
