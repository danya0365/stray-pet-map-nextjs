/**
 * Activity Feed Entity
 * Unified activity item surfaced from posts, comments, and interactions
 */

export type ActivityType =
  | "new_post"
  | "status_changed"
  | "new_comment"
  | "comment_reply"
  | "like_milestone"
  | "badge_unlock"
  | "post_expiring_soon";

export interface ActivityActor {
  id: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
}

export interface ActivityPayload {
  postId?: string;
  postTitle?: string;
  postThumbnailUrl?: string;
  postPurpose?: string;
  postStatus?: string;
  postOutcome?: string;
  commentId?: string;
  commentContent?: string;
  parentCommentId?: string;
  parentCommentContent?: string;
  likeCount?: number;
  badgeName?: string;
  badgeIcon?: string;
  badgeDescription?: string;
  daysRemaining?: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: ActivityActor;
  payload: ActivityPayload;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFeedResult {
  items: ActivityItem[];
  hasMore: boolean;
  nextCursor?: string;
}
