import type {
  CommentListOptions,
  CommentReplyOptions,
  CommentReplyResult,
  ICommentRepository,
} from "@/application/repositories/ICommentRepository";
import type {
  Comment,
  CommentAuthor,
  CommentGamificationInfo,
  CommentReactionType,
  CommentThread,
  CreateCommentData,
  UpdateCommentData,
} from "@/domain/entities/comment";
import type {
  CommentLeaderboardEntry,
  CommentLeaderboardPeriod,
  UserCommentStats,
} from "@/domain/entities/comment-stats";

// Mock authors
const MOCK_AUTHORS: CommentAuthor[] = [
  {
    profileId: "user-001",
    displayName: "คุณใจดี",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=kind",
    level: 5,
    primaryBadge: "🐾",
  },
  {
    profileId: "user-002",
    displayName: "นักรบแมวจร",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior",
    level: 8,
    primaryBadge: "🏆",
  },
  {
    profileId: "user-003",
    displayName: "ผู้ช่วยเหลือสัตว์",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=helper",
    level: 3,
  },
  {
    profileId: "user-004",
    displayName: "คนรักหมา",
    level: 2,
  },
];

// Generate mock comments with nested structure
function generateMockComments(petPostId: string): Comment[] {
  const now = new Date();
  const baseTime = now.getTime();

  const comments: Comment[] = [
    // Top-level comment 1
    {
      id: "cmt-001",
      petPostId,
      profileId: "user-001",
      author: MOCK_AUTHORS[0],
      depth: 0,
      path: ["cmt-001"],
      content:
        "น้องน่ารักมากเลยค่ะ! อยากช่วยเหลือไม่รู้ว่าตอนนี้น้องยังหาบ้านอยู่ไหม?",
      isEdited: false,
      isDeleted: false,
      replyCount: 2,
      likeCount: 5,
      reactionCounts: { like: 5, helpful: 2, insightful: 1, heart: 3 },
      replies: [
        {
          id: "cmt-002",
          petPostId,
          profileId: "user-002",
          author: MOCK_AUTHORS[1],
          parentCommentId: "cmt-001",
          depth: 1,
          path: ["cmt-001", "cmt-002"],
          content:
            "ยังหาบ้านอยู่ครับ น้องอยู่ที่ศูนย์พักพิงฯ ใกล้ๆ รังสิต ถ้าสนใจติดต่อได้เลย",
          isEdited: false,
          isDeleted: false,
          replyCount: 1,
          likeCount: 3,
          reactionCounts: { like: 3, helpful: 4, insightful: 0, heart: 1 },
          replies: [
            {
              id: "cmt-003",
              petPostId,
              profileId: "user-001",
              author: MOCK_AUTHORS[0],
              parentCommentId: "cmt-002",
              depth: 2,
              path: ["cmt-001", "cmt-002", "cmt-003"],
              content: "ขอบคุณมากค่ะ จะลองติดต่อไป 🙏",
              isEdited: false,
              isDeleted: false,
              replyCount: 0,
              likeCount: 1,
              reactionCounts: { like: 1, helpful: 0, insightful: 0, heart: 2 },
              createdAt: new Date(baseTime - 1000 * 60 * 60 * 20).toISOString(),
              updatedAt: new Date(baseTime - 1000 * 60 * 60 * 20).toISOString(),
            },
          ],
          createdAt: new Date(baseTime - 1000 * 60 * 60 * 22).toISOString(),
          updatedAt: new Date(baseTime - 1000 * 60 * 60 * 22).toISOString(),
        },
      ],
      createdAt: new Date(baseTime - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(baseTime - 1000 * 60 * 60 * 24).toISOString(),
    },
    // Top-level comment 2
    {
      id: "cmt-004",
      petPostId,
      profileId: "user-003",
      author: MOCK_AUTHORS[2],
      depth: 0,
      path: ["cmt-004"],
      content: "ฉีดวัคซีนครบแล้วหรือยังคะ? ถ้ายังรบกวนแจ้งวันที่ฉีดด้วยจะดีมาก",
      isEdited: true,
      editedAt: new Date(baseTime - 1000 * 60 * 60 * 12).toISOString(),
      isDeleted: false,
      replyCount: 1,
      likeCount: 2,
      reactionCounts: { like: 2, helpful: 3, insightful: 1, heart: 0 },
      replies: [
        {
          id: "cmt-005",
          petPostId,
          profileId: "user-002",
          author: MOCK_AUTHORS[1],
          parentCommentId: "cmt-004",
          depth: 1,
          path: ["cmt-004", "cmt-005"],
          content: "ฉีดครบแล้วครับ มีสมุดวัคซีนด้วย รับไปแล้วเอาไปต่อได้เลย",
          isEdited: false,
          isDeleted: false,
          replyCount: 0,
          likeCount: 4,
          reactionCounts: { like: 4, helpful: 5, insightful: 0, heart: 1 },
          createdAt: new Date(baseTime - 1000 * 60 * 60 * 10).toISOString(),
          updatedAt: new Date(baseTime - 1000 * 60 * 60 * 10).toISOString(),
        },
      ],
      createdAt: new Date(baseTime - 1000 * 60 * 60 * 14).toISOString(),
      updatedAt: new Date(baseTime - 1000 * 60 * 60 * 12).toISOString(),
    },
    // Top-level comment 3 (deleted example)
    {
      id: "cmt-006",
      petPostId,
      profileId: "user-004",
      author: MOCK_AUTHORS[3],
      depth: 0,
      path: ["cmt-006"],
      content: "ข้อความนี้ถูกลบ",
      isEdited: false,
      isDeleted: true,
      deletedAt: new Date(baseTime - 1000 * 60 * 60 * 5).toISOString(),
      deletedReason: "self",
      replyCount: 0,
      likeCount: 0,
      reactionCounts: { like: 0, helpful: 0, insightful: 0, heart: 0 },
      createdAt: new Date(baseTime - 1000 * 60 * 60 * 8).toISOString(),
      updatedAt: new Date(baseTime - 1000 * 60 * 60 * 5).toISOString(),
    },
    // Top-level comment 4
    {
      id: "cmt-007",
      petPostId,
      profileId: "user-002",
      author: MOCK_AUTHORS[1],
      depth: 0,
      path: ["cmt-007"],
      content:
        "อัพเดทล่าสุด: น้องกินข้าวเก่งมาก ชอบเล่นกับของเล่นเชือก ใครสนใจรับเลี้ยงรีบติดต่อนะครับ",
      isEdited: false,
      isDeleted: false,
      replyCount: 0,
      likeCount: 8,
      reactionCounts: { like: 8, helpful: 1, insightful: 0, heart: 5 },
      createdAt: new Date(baseTime - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(baseTime - 1000 * 60 * 30).toISOString(),
    },
  ];

  return comments;
}

// Mock user stats
const MOCK_USER_STATS: UserCommentStats = {
  profileId: "user-001",
  totalComments: 45,
  totalReplies: 12,
  totalReceivedReplies: 28,
  totalLikesReceived: 156,
  totalLikesGiven: 89,
  totalHelpfulReceived: 23,
  avgReplyDepth: 2.5,
  helpfulComments: 15,
  currentCommentStreak: 7,
  longestCommentStreak: 14,
  lastCommentDate: new Date().toISOString().split("T")[0],
  updatedAt: new Date().toISOString(),
};

// Mock leaderboard
const MOCK_LEADERBOARD: CommentLeaderboardEntry[] = [
  {
    profileId: "user-002",
    displayName: "นักรบแมวจร",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior",
    level: 8,
    commentsCount: 128,
    likesReceived: 456,
    repliesReceived: 89,
    rank: 1,
  },
  {
    profileId: "user-001",
    displayName: "คุณใจดี",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=kind",
    level: 5,
    commentsCount: 45,
    likesReceived: 156,
    repliesReceived: 28,
    rank: 2,
  },
  {
    profileId: "user-003",
    displayName: "ผู้ช่วยเหลือสัตว์",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=helper",
    level: 3,
    commentsCount: 23,
    likesReceived: 78,
    repliesReceived: 15,
    rank: 3,
  },
];

/**
 * MockCommentRepository
 * Mock implementation for development and testing
 */
export class MockCommentRepository implements ICommentRepository {
  private comments: Map<string, Comment[]> = new Map();
  private likes: Map<string, Set<string>> = new Map(); // commentId -> Set<profileId>
  private reactions: Map<string, Map<string, CommentReactionType>> = new Map(); // commentId -> Map<profileId, type>
  private currentUserId: string = "current-user";

  constructor() {
    // Initialize with mock data for pet post "pet-001"
    this.comments.set("pet-001", generateMockComments("pet-001"));
  }

  // ============================================================================
  // Core CRUD Operations
  // ============================================================================

  async create(data: CreateCommentData, profileId: string): Promise<Comment> {
    const now = new Date().toISOString();
    const author = MOCK_AUTHORS.find((a) => a.profileId === profileId) || {
      profileId,
      displayName: "Anonymous",
      level: 1,
    };

    let depth = 0;
    let path: string[] = [];

    if (data.parentCommentId) {
      // Find parent to calculate depth and path
      const allComments = this.getAllComments(data.petPostId);
      const parent = allComments.find((c) => c.id === data.parentCommentId);
      if (parent) {
        depth = parent.depth + 1;
        path = [...parent.path, `cmt-${Date.now()}`];
      }
    } else {
      path = [`cmt-${Date.now()}`];
    }

    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      petPostId: data.petPostId,
      profileId,
      author,
      parentCommentId: data.parentCommentId,
      depth,
      path,
      content: data.content,
      isEdited: false,
      isDeleted: false,
      replyCount: 0,
      likeCount: 0,
      reactionCounts: { like: 0, helpful: 0, insightful: 0, heart: 0 },
      createdAt: now,
      updatedAt: now,
    };

    // Add to storage
    const existingComments = this.comments.get(data.petPostId) || [];
    this.comments.set(data.petPostId, [newComment, ...existingComments]);

    return newComment;
  }

  async findById(id: string): Promise<Comment | null> {
    for (const comments of this.comments.values()) {
      const found = this.findCommentByIdRecursive(comments, id);
      if (found) return found;
    }
    return null;
  }

  async findByPetPostId(
    petPostId: string,
    options: CommentListOptions,
  ): Promise<CommentThread> {
    const allComments = this.comments.get(petPostId) || [];
    let topLevelComments = allComments.filter(
      (c) => c.depth === 0 && !c.isDeleted,
    );

    // Apply pagination
    const { pagination } = options;
    let hasMore = false;
    let nextCursor: string | undefined;

    if (pagination.type === "offset") {
      const offset = (pagination.page - 1) * pagination.perPage;
      const total = topLevelComments.length;
      topLevelComments = topLevelComments.slice(
        offset,
        offset + pagination.perPage,
      );
      hasMore = offset + topLevelComments.length < total;
    } else {
      const limit = pagination.limit;
      if (topLevelComments.length > limit) {
        hasMore = true;
        nextCursor = "mock-cursor-" + Date.now();
      }
      topLevelComments = topLevelComments.slice(0, limit);
    }

    // Apply user interaction state
    const enrichedComments = topLevelComments.map((c) =>
      this.enrichWithUserState(c, this.currentUserId),
    );

    return {
      petPostId,
      totalComments: allComments.filter((c) => !c.isDeleted).length,
      topLevelComments: enrichedComments,
      hasMore,
      nextCursor,
    };
  }

  async update(
    id: string,
    data: UpdateCommentData,
    profileId: string,
  ): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) throw new Error("Comment not found");
    if (comment.profileId !== profileId) throw new Error("Not authorized");

    comment.content = data.content;
    comment.isEdited = true;
    comment.editedAt = new Date().toISOString();
    comment.updatedAt = new Date().toISOString();

    return comment;
  }

  async softDelete(
    id: string,
    profileId: string,
    reason: "self" | "moderator",
  ): Promise<void> {
    const comment = await this.findById(id);
    if (!comment) throw new Error("Comment not found");
    if (comment.profileId !== profileId) throw new Error("Not authorized");

    comment.isDeleted = true;
    comment.deletedAt = new Date().toISOString();
    comment.deletedReason = reason;
  }

  // ============================================================================
  // Thread Operations
  // ============================================================================

  async findReplies(
    parentCommentId: string,
    options: CommentReplyOptions,
  ): Promise<CommentReplyResult> {
    let replies: Comment[] = [];
    for (const comments of this.comments.values()) {
      for (const comment of this.flattenComments(comments)) {
        if (comment.parentCommentId === parentCommentId && !comment.isDeleted) {
          replies.push(this.enrichWithUserState(comment, this.currentUserId));
        }
      }
    }

    // Apply pagination
    const { pagination } = options;
    let hasMore = false;
    let nextCursor: string | undefined;

    if (pagination.type === "offset") {
      const offset = (pagination.page - 1) * pagination.perPage;
      const total = replies.length;
      replies = replies.slice(offset, offset + pagination.perPage);
      hasMore = offset + replies.length < total;
    } else {
      const limit = pagination.limit;
      if (replies.length > limit) {
        hasMore = true;
        nextCursor = "mock-cursor-" + Date.now();
      }
      replies = replies.slice(0, limit);
    }

    return {
      replies,
      hasMore,
      nextCursor,
    };
  }

  async getThreadTree(
    commentId: string,
    maxDepth = 3,
  ): Promise<Comment | null> {
    const comment = await this.findById(commentId);
    if (!comment) return null;

    // Load replies up to maxDepth
    if (comment.depth < maxDepth) {
      const result = await this.findReplies(commentId, {
        pagination: { type: "cursor", limit: 100 }, // Load all for tree view
      });
      comment.replies = result.replies;
    }

    return this.enrichWithUserState(comment, this.currentUserId);
  }

  // ============================================================================
  // Engagement Operations
  // ============================================================================

  async addLike(commentId: string, profileId: string): Promise<void> {
    const likes = this.likes.get(commentId) || new Set();
    likes.add(profileId);
    this.likes.set(commentId, likes);

    // Update comment like count
    const comment = await this.findById(commentId);
    if (comment) {
      comment.likeCount = likes.size;
    }
  }

  async removeLike(commentId: string, profileId: string): Promise<void> {
    const likes = this.likes.get(commentId);
    if (likes) {
      likes.delete(profileId);
      // Update comment like count
      const comment = await this.findById(commentId);
      if (comment) {
        comment.likeCount = likes.size;
      }
    }
  }

  async addReaction(
    commentId: string,
    profileId: string,
    type: CommentReactionType,
  ): Promise<void> {
    const reactions = this.reactions.get(commentId) || new Map();
    reactions.set(profileId, type);
    this.reactions.set(commentId, reactions);

    // Update reaction counts
    const comment = await this.findById(commentId);
    if (comment) {
      comment.reactionCounts[type] = (comment.reactionCounts[type] || 0) + 1;
    }
  }

  async removeReaction(commentId: string, profileId: string): Promise<void> {
    const reactions = this.reactions.get(commentId);
    if (reactions) {
      const type = reactions.get(profileId);
      if (type) {
        reactions.delete(profileId);
        // Update reaction counts
        const comment = await this.findById(commentId);
        if (comment) {
          comment.reactionCounts[type] = Math.max(
            0,
            (comment.reactionCounts[type] || 0) - 1,
          );
        }
      }
    }
  }

  async hasLiked(commentId: string, profileId: string): Promise<boolean> {
    const likes = this.likes.get(commentId);
    return likes?.has(profileId) || false;
  }

  async getUserReaction(
    commentId: string,
    profileId: string,
  ): Promise<CommentReactionType | null> {
    const reactions = this.reactions.get(commentId);
    return reactions?.get(profileId) || null;
  }

  // ============================================================================
  // Statistics & Gamification
  // ============================================================================

  async getUserStats(profileId: string): Promise<UserCommentStats> {
    return {
      ...MOCK_USER_STATS,
      profileId,
    };
  }

  async getLeaderboard(
    period: CommentLeaderboardPeriod,
    limit = 10,
  ): Promise<CommentLeaderboardEntry[]> {
    return MOCK_LEADERBOARD.slice(0, limit);
  }

  async getGamificationInfo(
    profileId: string,
    action: "comment_created" | "reply_created",
  ): Promise<CommentGamificationInfo> {
    const pointsEarned = action === "comment_created" ? 5 : 3;
    const streakBonus = 0;

    return {
      pointsEarned,
      streakBonus,
    };
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async countByPetPostId(petPostId: string): Promise<number> {
    const comments = this.comments.get(petPostId) || [];
    return comments.filter((c) => !c.isDeleted).length;
  }

  async exists(id: string): Promise<boolean> {
    const found = await this.findById(id);
    return found !== null;
  }

  async getCommentDepth(commentId: string): Promise<number> {
    const comment = await this.findById(commentId);
    return comment?.depth || 0;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getAllComments(petPostId: string): Comment[] {
    const comments = this.comments.get(petPostId) || [];
    return this.flattenComments(comments);
  }

  private flattenComments(comments: Comment[]): Comment[] {
    const result: Comment[] = [];
    for (const comment of comments) {
      result.push(comment);
      if (comment.replies) {
        result.push(...this.flattenComments(comment.replies));
      }
    }
    return result;
  }

  private findCommentByIdRecursive(
    comments: Comment[],
    id: string,
  ): Comment | null {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = this.findCommentByIdRecursive(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  private enrichWithUserState(comment: Comment, profileId: string): Comment {
    return {
      ...comment,
      userHasLiked: this.likes.get(comment.id)?.has(profileId) || false,
      userReaction: this.reactions.get(comment.id)?.get(profileId) || undefined,
    };
  }

  // Test helper methods
  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  reset(): void {
    this.comments.clear();
    this.likes.clear();
    this.reactions.clear();
    this.comments.set("pet-001", generateMockComments("pet-001"));
  }
}
