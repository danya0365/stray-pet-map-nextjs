/**
 * Comment Stats Entity
 * User statistics for comment gamification
 */

export interface UserCommentStats {
  profileId: string;
  
  // Basic stats
  totalComments: number;
  totalReplies: number; // Comments that are replies to others
  totalReceivedReplies: number; // Replies received on their comments
  
  // Engagement
  totalLikesReceived: number;
  totalLikesGiven: number;
  totalHelpfulReceived: number;
  
  // Quality indicators
  avgReplyDepth: number;
  helpfulComments: number; // Comments marked as helpful
  
  // Streak tracking
  currentCommentStreak: number; // Days with at least 1 comment
  longestCommentStreak: number;
  lastCommentDate?: string;
  
  updatedAt: string;
}

export interface CommentLeaderboardEntry {
  profileId: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  
  // Period stats
  commentsCount: number;
  likesReceived: number;
  repliesReceived: number;
  
  // Rank
  rank: number;
}

export type CommentLeaderboardPeriod = 'week' | 'month' | 'all';

// Badge thresholds
export const COMMENT_BADGE_THRESHOLDS = {
  ACTIVE_COMMENTER: {
    BRONZE: 50,
    SILVER: 200,
    GOLD: 500,
  },
  HELPFUL_RESPONDER: 20, // replies received
  COMMUNITY_CONNECTOR: 3.0, // avg reply depth
  STREAK: {
    SILVER: 7,
    GOLD: 30,
    PLATINUM: 100,
  },
  LIKED_COMMENTER: {
    BRONZE: 100,
    SILVER: 500,
    GOLD: 2000,
  },
} as const;
