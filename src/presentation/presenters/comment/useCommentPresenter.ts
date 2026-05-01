"use client";

/**
 * useCommentPresenter
 * Custom hook for Comment presenter state management
 * ✅ Uses presenter pattern with repository injection
 * ✅ Follows Clean Architecture pattern
 */

import type { CommentListOptions } from "@/application/repositories/ICommentRepository";
import type {
  Comment,
  CommentReactionType,
  CreateCommentData,
  UpdateCommentData,
} from "@/domain/entities/comment";
import { useAuthStore } from "@/presentation/stores/useAuthStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CommentPresenter } from "./CommentPresenter";
import { createClientCommentPresenter } from "./CommentPresenterClientFactory";

// ============================================================================
// Types
// ============================================================================

export interface CommentThreadState {
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

export interface CommentFormState {
  isSubmitting: boolean;
  error: string | null;
  replyTo: Comment | null;
  editComment: Comment | null;
}

export interface CommentPresenterState {
  thread: CommentThreadState;
  form: CommentFormState;
  loadingReplies: Set<string>;
  showAuthPrompt: boolean;
  gamificationMessage: string | null;
}

export interface CommentPresenterActions {
  loadComments: (
    petPostId: string,
    options?: CommentListOptions,
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshComments: () => Promise<void>;
  createComment: (content: string) => Promise<void>;
  createReply: (parentCommentId: string, content: string) => Promise<void>;
  loadReplies: (parentCommentId: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleLike: (commentId: string) => Promise<void>;
  addReaction: (commentId: string, type: CommentReactionType) => Promise<void>;
  removeReaction: (commentId: string) => Promise<void>;
  setReplyTo: (comment: Comment | null) => void;
  setEditComment: (comment: Comment | null) => void;
  clearFormError: () => void;
  clearGamificationMessage: () => void;
  dismissAuthPrompt: () => void;
}

// ============================================================================
// Hook
// ============================================================================

interface UseCommentPresenterProps {
  petPostId: string;
  initialComments?: Comment[];
}

export function useCommentPresenter(
  { petPostId, initialComments = [] }: UseCommentPresenterProps,
  presenterOverride?: CommentPresenter,
): [CommentPresenterState, CommentPresenterActions] {
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  // Create presenter with repository via factory
  const presenter = useMemo(
    () => presenterOverride ?? createClientCommentPresenter(),
    [presenterOverride],
  );

  const isMountedRef = useRef(true);
  const currentPetPostIdRef = useRef(petPostId);

  // Thread state
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [totalCount, setTotalCount] = useState(initialComments.length);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [replyTo, setReplyToState] = useState<Comment | null>(null);
  const [editComment, setEditCommentState] = useState<Comment | null>(null);

  // UI state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [gamificationMessage, setGamificationMessage] = useState<string | null>(
    null,
  );

  // Reply loading state (per comment id)
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  // Update ref when petPostId changes
  useEffect(() => {
    currentPetPostIdRef.current = petPostId;
  }, [petPostId]);

  // ============================================================================
  // Load Comments
  // ============================================================================

  const loadComments = useCallback(
    async (targetPetPostId: string, options?: CommentListOptions) => {
      setLoading(true);
      setThreadError(null);

      try {
        const paginationOptions: CommentListOptions = options ?? {
          pagination: { type: "cursor", limit: 20 },
          sortBy: "newest",
        };

        const result = await presenter.getThread(
          targetPetPostId,
          paginationOptions,
        );

        if (isMountedRef.current) {
          if (result.success && result.data) {
            setComments(result.data.topLevelComments);
            setTotalCount(result.data.totalComments);
            setHasMore(result.data.hasMore);
            setNextCursor(result.data.nextCursor);
          } else {
            setThreadError(result.error || "Failed to load comments");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setThreadError(
            err instanceof Error ? err.message : "Failed to load comments",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [presenter],
  );

  // Load more comments using cursor pagination
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;

    setLoadingMore(true);

    try {
      const result = await presenter.getThread(currentPetPostIdRef.current, {
        pagination: { type: "cursor", cursor: nextCursor, limit: 20 },
        sortBy: "newest",
      });

      if (isMountedRef.current) {
        if (result.success && result.data) {
          setComments((prev) => [...prev, ...result.data!.topLevelComments]);
          setHasMore(result.data.hasMore);
          setNextCursor(result.data.nextCursor);
        }
      }
    } catch (err) {
      console.error("Error loading more comments:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
    }
  }, [hasMore, nextCursor, loadingMore, presenter]);

  const refreshComments = useCallback(async () => {
    await loadComments(currentPetPostIdRef.current);
  }, [loadComments]);

  // Initial load
  useEffect(() => {
    if (initialComments.length === 0) {
      loadComments(petPostId);
    }
  }, [petPostId, initialComments.length, loadComments]);

  // ============================================================================
  // Create Comment
  // ============================================================================

  const createComment = useCallback(
    async (content: string) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      setIsSubmitting(true);
      setFormError(null);

      try {
        const data: CreateCommentData = {
          petPostId: currentPetPostIdRef.current,
          content,
        };

        const result = await presenter.createComment(data, user.id);

        if (isMountedRef.current) {
          if (result.success && result.data) {
            // Add new comment to list
            setComments((prev) => [result.data!.comment, ...prev]);
            setTotalCount((prev) => prev + 1);

            // Show gamification message
            const message = presenter.getEngagementMessage(
              result.data.gamification,
            );
            if (message) {
              setGamificationMessage(message);
            }
          } else {
            setFormError(result.error || "Failed to create comment");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setFormError(
            err instanceof Error ? err.message : "Failed to create comment",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [isAuthenticated, user?.id, presenter],
  );

  // ============================================================================
  // Create Reply
  // ============================================================================

  const createReply = useCallback(
    async (parentCommentId: string, content: string) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      setIsSubmitting(true);
      setFormError(null);

      try {
        const data: CreateCommentData = {
          petPostId: currentPetPostIdRef.current,
          content,
          parentCommentId,
        };

        const result = await presenter.createComment(data, user.id);

        if (isMountedRef.current) {
          if (result.success && result.data) {
            // Recursively find parent at any depth and append reply
            const appendReply = (list: Comment[]): Comment[] =>
              list.map((comment) => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replyCount: comment.replyCount + 1,
                    replies: [...(comment.replies || []), result.data!.comment],
                  };
                }
                if (comment.replies && comment.replies.length > 0) {
                  return { ...comment, replies: appendReply(comment.replies) };
                }
                return comment;
              });

            setComments((prev) => appendReply(prev));
            setTotalCount((prev) => prev + 1);
            setReplyToState(null);

            // Show gamification message
            const message = presenter.getEngagementMessage(
              result.data.gamification,
            );
            if (message) {
              setGamificationMessage(message);
            }
          } else {
            setFormError(result.error || "Failed to create reply");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setFormError(
            err instanceof Error ? err.message : "Failed to create reply",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [isAuthenticated, user?.id, presenter],
  );

  // ============================================================================
  // Load Replies (lazy)
  // ============================================================================

  const loadReplies = useCallback(
    async (parentCommentId: string) => {
      setLoadingReplies((prev) => new Set(prev).add(parentCommentId));
      setThreadError(null);

      try {
        const result = await presenter.getReplies(parentCommentId, {
          pagination: { type: "cursor" as const, limit: 10 },
        });

        if (isMountedRef.current) {
          if (result.success && result.data) {
            const mergeReplies = (list: Comment[]): Comment[] =>
              list.map((comment) => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: result.data!.replies,
                  };
                }
                if (comment.replies && comment.replies.length > 0) {
                  return { ...comment, replies: mergeReplies(comment.replies) };
                }
                return comment;
              });

            setComments((prev) => mergeReplies(prev));
          } else {
            setThreadError(result.error || "Failed to load replies");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setThreadError(
            err instanceof Error ? err.message : "Failed to load replies",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingReplies((prev) => {
            const next = new Set(prev);
            next.delete(parentCommentId);
            return next;
          });
        }
      }
    },
    [presenter],
  );

  // ============================================================================
  // Update Comment
  // ============================================================================

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      setIsSubmitting(true);
      setFormError(null);

      try {
        const data: UpdateCommentData = { content };
        const result = await presenter.updateComment(commentId, data, user.id);

        if (isMountedRef.current) {
          if (result.success && result.data) {
            // Update comment in list
            setComments((prev) =>
              prev.map((comment) => {
                if (comment.id === commentId) {
                  return { ...comment, ...result.data };
                }
                // Check in replies
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: comment.replies.map((reply) =>
                      reply.id === commentId
                        ? { ...reply, ...result.data }
                        : reply,
                    ),
                  };
                }
                return comment;
              }),
            );
            setEditCommentState(null);
          } else {
            setFormError(result.error || "Failed to update comment");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setFormError(
            err instanceof Error ? err.message : "Failed to update comment",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [isAuthenticated, user?.id, presenter],
  );

  // ============================================================================
  // Delete Comment
  // ============================================================================

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await presenter.deleteComment(commentId, user.id);

        if (isMountedRef.current) {
          if (result.success) {
            // Mark as deleted in list
            setComments((prev) =>
              prev.map((comment) => {
                if (comment.id === commentId) {
                  return { ...comment, isDeleted: true };
                }
                // Check in replies
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: comment.replies.map((reply) =>
                      reply.id === commentId
                        ? { ...reply, isDeleted: true }
                        : reply,
                    ),
                  };
                }
                return comment;
              }),
            );
          } else {
            setFormError(result.error || "Failed to delete comment");
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setFormError(
            err instanceof Error ? err.message : "Failed to delete comment",
          );
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [isAuthenticated, user?.id, presenter],
  );

  // ============================================================================
  // Toggle Like
  // ============================================================================

  const toggleLike = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      // Optimistic update
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            const newHasLiked = !comment.userHasLiked;
            return {
              ...comment,
              userHasLiked: newHasLiked,
              likeCount: newHasLiked
                ? comment.likeCount + 1
                : comment.likeCount - 1,
            };
          }
          // Check in replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  const newHasLiked = !reply.userHasLiked;
                  return {
                    ...reply,
                    userHasLiked: newHasLiked,
                    likeCount: newHasLiked
                      ? reply.likeCount + 1
                      : reply.likeCount - 1,
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        }),
      );

      try {
        await presenter.toggleLike(commentId, user.id);
      } catch (err) {
        // Revert on error
        console.error("Error toggling like:", err);
        refreshComments();
      }
    },
    [isAuthenticated, user?.id, presenter, refreshComments],
  );

  // ============================================================================
  // Reactions
  // ============================================================================

  const addReaction = useCallback(
    async (commentId: string, type: CommentReactionType) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      // Optimistic update
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            const oldReaction = comment.userReaction;
            const newReactionCounts = { ...comment.reactionCounts };

            // Decrement old reaction if exists
            if (oldReaction) {
              newReactionCounts[oldReaction] = Math.max(
                0,
                newReactionCounts[oldReaction] - 1,
              );
            }

            // Increment new reaction
            newReactionCounts[type] = (newReactionCounts[type] || 0) + 1;

            return {
              ...comment,
              userReaction: type,
              reactionCounts: newReactionCounts,
            };
          }
          // Check in replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  const oldReaction = reply.userReaction;
                  const newReactionCounts = { ...reply.reactionCounts };

                  if (oldReaction) {
                    newReactionCounts[oldReaction] = Math.max(
                      0,
                      newReactionCounts[oldReaction] - 1,
                    );
                  }
                  newReactionCounts[type] = (newReactionCounts[type] || 0) + 1;

                  return {
                    ...reply,
                    userReaction: type,
                    reactionCounts: newReactionCounts,
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        }),
      );

      try {
        await presenter.addReaction(commentId, user.id, type);
      } catch (err) {
        console.error("Error adding reaction:", err);
        refreshComments();
      }
    },
    [isAuthenticated, user?.id, presenter, refreshComments],
  );

  const removeReaction = useCallback(
    async (commentId: string) => {
      if (!isAuthenticated || !user?.id) {
        setShowAuthPrompt(true);
        return;
      }

      // Optimistic update
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            const oldReaction = comment.userReaction;
            if (!oldReaction) return comment;

            return {
              ...comment,
              userReaction: undefined,
              reactionCounts: {
                ...comment.reactionCounts,
                [oldReaction]: Math.max(
                  0,
                  comment.reactionCounts[oldReaction] - 1,
                ),
              },
            };
          }
          // Check in replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  const oldReaction = reply.userReaction;
                  if (!oldReaction) return reply;

                  return {
                    ...reply,
                    userReaction: undefined,
                    reactionCounts: {
                      ...reply.reactionCounts,
                      [oldReaction]: Math.max(
                        0,
                        reply.reactionCounts[oldReaction] - 1,
                      ),
                    },
                  };
                }
                return reply;
              }),
            };
          }
          return comment;
        }),
      );

      try {
        await presenter.removeReaction(commentId, user.id);
      } catch (err) {
        console.error("Error removing reaction:", err);
        refreshComments();
      }
    },
    [isAuthenticated, user?.id, presenter, refreshComments],
  );

  // ============================================================================
  // UI Actions
  // ============================================================================

  const setReplyTo = useCallback((comment: Comment | null) => {
    setReplyToState(comment);
    setEditCommentState(null);
  }, []);

  const setEditComment = useCallback((comment: Comment | null) => {
    setEditCommentState(comment);
    setReplyToState(null);
  }, []);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);

  const clearGamificationMessage = useCallback(() => {
    setGamificationMessage(null);
  }, []);

  const dismissAuthPrompt = useCallback(() => {
    setShowAuthPrompt(false);
  }, []);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [
    {
      thread: {
        comments,
        totalCount,
        hasMore,
        loading,
        loadingMore,
        error: threadError,
      },
      loadingReplies,
      form: {
        isSubmitting,
        error: formError,
        replyTo,
        editComment,
      },
      showAuthPrompt,
      gamificationMessage,
    },
    {
      loadComments,
      loadMore,
      refreshComments,
      createComment,
      createReply,
      loadReplies,
      updateComment,
      deleteComment,
      toggleLike,
      addReaction,
      removeReaction,
      setReplyTo,
      setEditComment,
      clearFormError,
      clearGamificationMessage,
      dismissAuthPrompt,
    },
  ];
}
