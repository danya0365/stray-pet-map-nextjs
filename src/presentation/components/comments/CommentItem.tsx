"use client";

import type { Comment, CommentReactionType } from "@/domain/entities/comment";
import { Avatar } from "@/presentation/components/ui";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentReactions } from "./CommentReactions";

dayjs.extend(relativeTime);
dayjs.locale("th");

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onToggleLike: (commentId: string) => void;
  onAddReaction: (commentId: string, type: CommentReactionType) => void;
  onRemoveReaction: (commentId: string) => void;
  isSubmitting?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  onAddReaction,
  onRemoveReaction,
  isSubmitting = false,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isOwner = currentUserId === comment.profileId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Handle deleted comment
  if (comment.isDeleted) {
    return (
      <div className="py-3 text-sm text-foreground/40 italic">
        ข้อความนี้ถูกลบแล้ว
      </div>
    );
  }

  const handleReplySubmit = (content: string) => {
    onReply(comment.id, content);
    setIsReplying(false);
  };

  const handleEditSubmit = (content: string) => {
    onEdit(comment.id, content);
    setIsEditing(false);
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar
          src={comment.author.avatarUrl}
          alt={comment.author.displayName}
          name={comment.author.displayName}
          className="h-8 w-8 shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">
              {comment.author.displayName}
            </span>
            {comment.author.level && (
              <span className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                Lv.{comment.author.level}
              </span>
            )}
            <span className="text-xs text-foreground/40">
              {dayjs(comment.createdAt).fromNow()}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-foreground/40">(แก้ไข)</span>
            )}
          </div>

          {/* Edit form or Content */}
          {isEditing ? (
            <CommentForm
              initialContent={comment.content}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
              variant="compact"
            />
          ) : (
            <p className="text-sm text-foreground/80 whitespace-pre-line">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="mt-2 flex items-center gap-2">
              <CommentReactions
                likeCount={comment.likeCount}
                reactionCounts={comment.reactionCounts}
                userHasLiked={comment.userHasLiked}
                userReaction={comment.userReaction}
                onToggleLike={() => onToggleLike(comment.id)}
                onAddReaction={(type) => onAddReaction(comment.id, type)}
                onRemoveReaction={() => onRemoveReaction(comment.id)}
                disabled={isSubmitting}
              />

              {/* Reply button */}
              <button
                type="button"
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-foreground/60 transition-colors hover:bg-muted"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>ตอบกลับ</span>
              </button>

              {/* More actions (owner only) */}
              {isOwner && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowActions(!showActions)}
                    className="rounded-lg p-1 text-foreground/40 transition-colors hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {showActions && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActions(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-border bg-card shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setShowActions(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(comment.id);
                            setShowActions(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          ลบ
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reply form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setIsReplying(false)}
                placeholder={`ตอบกลับ ${comment.author.displayName}...`}
                replyToName={comment.author.displayName}
                isSubmitting={isSubmitting}
                variant="compact"
              />
            </div>
          )}

          {/* Nested replies */}
          {hasReplies && (
            <div className="mt-4 space-y-4 border-l-2 border-border/50 pl-4">
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleLike={onToggleLike}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
