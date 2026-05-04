/**
 * Comment Entity
 * Nested comment thread structure with gamification support
 */

export type CommentReactionType = "like" | "helpful" | "insightful" | "heart";

export const COMMENT_REACTION_TYPES: CommentReactionType[] = [
  "like",
  "helpful",
  "insightful",
  "heart",
];

export interface CommentAuthor {
  profileId: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  primaryBadge?: string;
}

export interface Comment {
  id: string;
  petPostId: string;
  profileId: string;

  // Author info (denormalized for display)
  author: CommentAuthor;

  // Thread structure
  parentCommentId?: string;
  depth: number;
  path: string[]; // Array of ancestor IDs

  // Content
  content: string;
  isEdited: boolean;
  editedAt?: string;

  // Soft delete
  isDeleted: boolean;
  deletedAt?: string;
  deletedReason?: "self" | "moderator" | "system";

  // Engagement
  replyCount: number;
  likeCount: number;
  reactionCounts: Record<CommentReactionType, number>;

  // User interaction state (populated for logged-in user)
  userHasLiked?: boolean;
  userReaction?: CommentReactionType;

  // Replies (populated when fetching thread)
  replies?: Comment[];

  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  id: string;
  commentId: string;
  profileId: string;
  reactionType: CommentReactionType;
  createdAt: string;
}

export interface CreateCommentData {
  petPostId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentThread {
  petPostId: string;
  totalComments: number;
  topLevelComments: Comment[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface CommentGamificationInfo {
  pointsEarned: number;
  streakBonus?: number;
  badgeUnlocked?: {
    type: string;
    tier: string;
    name: string;
    description: string;
    icon: string;
  };
  streakUpdated?: {
    current: number;
    longest: number;
  };
}

export interface CommentListOptions {
  cursor?: string;
  limit?: number;
  depth?: number;
  sortBy?: "newest" | "oldest" | "popular";
}

export interface CommentReplyOptions {
  cursor?: string;
  limit?: number;
}

// Default empty reaction counts (regular export for value usage)
export const defaultReactionCounts: Record<CommentReactionType, number> = {
  like: 0,
  helpful: 0,
  insightful: 0,
  heart: 0,
};

// Validation constants (regular export for value usage)
export const COMMENT_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 2000,
  MAX_DEPTH: 10,
  PAGE_SIZE: {
    TOP_LEVEL: 20,
    REPLIES: 10,
  },
} as const;

// Points configuration (regular export for value usage)
export const COMMENT_POINTS = {
  CREATE_COMMENT: 5,
  CREATE_REPLY: 3,
  RECEIVE_REPLY: 2,
  RECEIVE_LIKE: 1,
  MARKED_HELPFUL: 10,
  DAILY_CAP: 200,
  LIKES_CAP: 50,
  STREAK_BONUS: {
    3: 5,
    7: 15,
    14: 30,
    30: 50,
    60: 100,
    100: 200,
  } as Record<number, number>,
} as const;
