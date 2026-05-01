"use client";

import type { Comment, CommentReactionType } from "@/domain/entities/comment";
import { ChevronDown, Loader2, MessageSquare } from "lucide-react";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  totalCount: number;
  currentUserId?: string;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  loadingReplies?: Set<string>;
  onReply: (parentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onToggleLike: (commentId: string) => void;
  onAddReaction: (commentId: string, type: CommentReactionType) => void;
  onRemoveReaction: (commentId: string) => void;
  onLoadReplies?: (commentId: string) => void;
  onLoadMore?: () => void;
  isSubmitting?: boolean;
}

export function CommentList({
  comments,
  totalCount,
  currentUserId,
  loading = false,
  loadingMore = false,
  hasMore = false,
  loadingReplies,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  onAddReaction,
  onRemoveReaction,
  onLoadReplies,
  onLoadMore,
  isSubmitting = false,
}: CommentListProps) {
  if (loading) {
    return (
      <div className="space-y-6 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <MessageSquare className="h-6 w-6 text-foreground/40" />
        </div>
        <p className="text-sm text-foreground/60">ยังไม่มีความคิดเห็น</p>
        <p className="mt-1 text-xs text-foreground/40">
          เป็นคนแรกที่แสดงความคิดเห็น!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        <MessageSquare className="h-4 w-4" />
        <span>{totalCount} ความคิดเห็น</span>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleLike={onToggleLike}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onLoadReplies={onLoadReplies}
            isLoadingReplies={loadingReplies?.has(comment.id)}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4">
          <button
            onClick={onLoadMore}
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
                <span>โหลดเพิ่ม ({totalCount - comments.length} รายการ)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
