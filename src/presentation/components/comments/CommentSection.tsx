"use client";

import type { Comment } from "@/domain/entities/comment";
import { useCommentPresenter } from "@/presentation/presenters/comment/useCommentPresenter";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { Trophy, X } from "lucide-react";
import Link from "next/link";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentSectionProps {
  petPostId: string;
  initialComments?: Comment[];
  initialTotalCount?: number;
}

export function CommentSection({
  petPostId,
  initialComments = [],
  initialTotalCount = 0,
}: CommentSectionProps) {
  const { user } = useAuthStore();

  const [state, actions] = useCommentPresenter({
    petPostId,
    initialComments,
  });

  const {
    thread: { comments, totalCount, loading, loadingMore, hasMore, error },
    form: { isSubmitting, error: formError, replyTo, editComment },
    showAuthPrompt,
    gamificationMessage,
  } = state;

  const {
    createComment,
    createReply,
    updateComment,
    deleteComment,
    toggleLike,
    addReaction,
    removeReaction,
    loadMore,
    refreshComments,
    setReplyTo,
    setEditComment,
    clearGamificationMessage,
  } = actions;

  const handleCommentSubmit = (content: string) => {
    if (editComment) {
      updateComment(editComment.id, content);
    } else if (replyTo) {
      createReply(replyTo.id, content);
    } else {
      createComment(content);
    }
  };

  const displayTotalCount = totalCount || initialTotalCount || comments.length;

  return (
    <section className="mt-8 border-t border-border pt-8">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">ความคิดเห็น</h2>
        {displayTotalCount > 0 && (
          <span className="text-sm text-foreground/60">
            {displayTotalCount} รายการ
          </span>
        )}
      </div>

      {/* Gamification Toast */}
      {gamificationMessage && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border border-amber-200">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="flex-1 text-sm text-amber-800">
            {gamificationMessage}
          </span>
          <button
            type="button"
            onClick={clearGamificationMessage}
            className="rounded-full p-1 text-amber-500 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-sm text-foreground/80">
            กรุณา{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              เข้าสู่ระบบ
            </Link>{" "}
            เพื่อแสดงความคิดเห็น
          </p>
        </div>
      )}

      {/* Comment Form */}
      <div className="mb-8">
        <CommentForm
          onSubmit={handleCommentSubmit}
          onCancel={
            replyTo || editComment
              ? () => {
                  setReplyTo(null);
                  setEditComment(null);
                }
              : undefined
          }
          initialContent={editComment?.content || ""}
          placeholder={
            editComment
              ? "แก้ไขความคิดเห็น..."
              : replyTo
                ? `ตอบกลับ ${replyTo.author.displayName}...`
                : "แสดงความคิดเห็นของคุณ..."
          }
          replyToName={replyTo?.author.displayName}
          isSubmitting={isSubmitting}
          error={formError}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          <p>{error}</p>
          <button
            type="button"
            onClick={refreshComments}
            className="mt-1 text-xs font-medium text-red-700 hover:underline"
          >
            ลองใหม่
          </button>
        </div>
      )}

      {/* Comment List */}
      <CommentList
        comments={comments}
        totalCount={displayTotalCount}
        currentUserId={user?.id}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onReply={(parentId, content) => createReply(parentId, content)}
        onEdit={(commentId, content) => updateComment(commentId, content)}
        onDelete={deleteComment}
        onToggleLike={toggleLike}
        onAddReaction={addReaction}
        onRemoveReaction={removeReaction}
        onLoadMore={loadMore}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
