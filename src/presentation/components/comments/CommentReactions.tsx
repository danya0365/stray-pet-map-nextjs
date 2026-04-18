"use client";

import type { CommentReactionType } from "@/domain/entities/comment";
import { Heart, Lightbulb, ThumbsUp } from "lucide-react";

interface CommentReactionsProps {
  likeCount: number;
  reactionCounts: Record<CommentReactionType, number>;
  userHasLiked?: boolean;
  userReaction?: CommentReactionType;
  onToggleLike: () => void;
  onAddReaction: (type: CommentReactionType) => void;
  onRemoveReaction: () => void;
  disabled?: boolean;
}

const REACTION_CONFIG: Record<
  CommentReactionType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  like: {
    icon: <ThumbsUp className="h-3.5 w-3.5" />,
    label: "ถูกใจ",
    color: "text-blue-500",
  },
  helpful: {
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    label: "มีประโยชน์",
    color: "text-emerald-500",
  },
  insightful: {
    icon: <span className="text-sm">💡</span>,
    label: "น่าสนใจ",
    color: "text-amber-500",
  },
  heart: {
    icon: <Heart className="h-3.5 w-3.5" />,
    label: "หัวใจ",
    color: "text-pink-500",
  },
};

export function CommentReactions({
  likeCount,
  reactionCounts,
  userHasLiked,
  userReaction,
  onToggleLike,
  onAddReaction,
  onRemoveReaction,
  disabled = false,
}: CommentReactionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* Like button */}
      <button
        type="button"
        onClick={onToggleLike}
        disabled={disabled}
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
          userHasLiked
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
            : "text-foreground/60 hover:bg-muted"
        } disabled:opacity-50`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        <span>{likeCount > 0 ? likeCount : "ถูกใจ"}</span>
      </button>

      {/* Other reactions */}
      {(Object.keys(REACTION_CONFIG) as CommentReactionType[]).map((type) => {
        if (type === "like") return null; // Like is handled separately

        const count = reactionCounts[type] || 0;
        const isActive = userReaction === type;
        const config = REACTION_CONFIG[type];

        if (count === 0 && !isActive) return null;

        return (
          <button
            key={type}
            type="button"
            onClick={() =>
              isActive ? onRemoveReaction() : onAddReaction(type)
            }
            disabled={disabled}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
              isActive
                ? `bg-opacity-20 ${config.color} bg-current`
                : "text-foreground/60 hover:bg-muted"
            } disabled:opacity-50`}
          >
            {config.icon}
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
