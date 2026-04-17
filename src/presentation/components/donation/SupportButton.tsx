"use client";

import { Heart } from "lucide-react";

interface SupportButtonProps {
  onClick: () => void;
  variant?: "floating" | "header" | "footer";
}

export function SupportButton({
  onClick,
  variant = "floating",
}: SupportButtonProps) {
  if (variant === "header") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
      >
        <Heart className="h-4 w-4" />
        <span className="hidden sm:inline">ให้กำลังใจ</span>
      </button>
    );
  }

  if (variant === "footer") {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <Heart className="h-4 w-4" />
        <span>ให้กำลังใจทีมงาน</span>
      </button>
    );
  }

  // Floating button (default)
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 transition-all hover:scale-110 hover:shadow-xl active:scale-95"
      aria-label="ให้กำลังใจทีมงาน"
    >
      <Heart className="h-6 w-6" />
    </button>
  );
}
