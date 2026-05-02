"use client";

import type { ActivityItem, ActivityType } from "@/domain/entities/activity";
import { Avatar } from "@/presentation/components/ui";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  AlertTriangle,
  ArrowRight,
  Heart,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.locale("th");

interface ActivityCardProps {
  activity: ActivityItem;
  index: number;
}

const TYPE_CONFIG: Record<
  ActivityType,
  {
    label: string;
    icon: React.ReactNode;
  }
> = {
  new_post: {
    label: "โพสต์ใหม่",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  status_changed: {
    label: "มีคำตอบแล้ว",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  new_comment: {
    label: "ความคิดเห็นใหม่",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
  },
  comment_reply: {
    label: "ตอบกลับ",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
  like_milestone: {
    label: "ถูกใจ",
    icon: <Heart className="h-3.5 w-3.5" />,
  },
  badge_unlock: {
    label: "Badge ใหม่",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  post_expiring_soon: {
    label: "ใกล้หมดอายุ",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

function activityStyle(type: ActivityType) {
  return {
    color: `var(--activity-${type}-text)`,
    backgroundColor: `var(--activity-${type}-bg)`,
    borderColor: `var(--activity-${type}-border)`,
  };
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const config = TYPE_CONFIG[activity.type];
  const isPostActivity =
    activity.type === "new_post" || activity.type === "status_changed";
  const isSuccessStory =
    activity.type === "status_changed" &&
    (activity.payload.postOutcome === "owner_found" ||
      activity.payload.postOutcome === "rehomed");

  const cardBase =
    "group rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";

  const linkHref = activity.payload.postId
    ? `/pets/${activity.payload.postId}`
    : "#";

  return (
    <div
      className={`${cardBase} ${isSuccessStory ? "" : "border-border"}`}
      style={{
        animationDelay: `${index * 50}ms`,
        ...(isSuccessStory
          ? {
              borderColor: "var(--activity-status_changed-border)",
              background: `linear-gradient(to bottom right, var(--success-card-from), var(--success-card-to))`,
            }
          : { borderColor: activityStyle(activity.type).borderColor }),
      }}
    >
      {/* Header: actor + type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            src={activity.actor.avatarUrl}
            alt={activity.actor.displayName}
            name={activity.actor.displayName}
            className="h-8 w-8 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium truncate">
                {activity.actor.displayName}
              </span>
              <span className="text-xs text-foreground/40 whitespace-nowrap">
                Lv.{activity.actor.level}
              </span>
            </div>
            <span className="text-xs text-foreground/40">
              {dayjs(activity.occurredAt).fromNow()}
            </span>
          </div>
        </div>

        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
          style={activityStyle(activity.type)}
        >
          {config.icon}
          {config.label}
        </span>
      </div>

      {/* Content */}
      <div className="mt-3">
        {isPostActivity && activity.payload.postThumbnailUrl ? (
          <Link href={linkHref} className="flex gap-3 group/link">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={activity.payload.postThumbnailUrl}
                alt={activity.payload.postTitle ?? "รูปโพสต์"}
                fill
                className="object-cover transition-transform group-hover/link:scale-105"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-2 group-hover/link:text-primary transition-colors">
                {activity.payload.postTitle ?? "โพสต์ใหม่"}
              </h3>
              {activity.type === "new_post" && activity.payload.postPurpose && (
                <span className="mt-1 inline-block text-xs text-foreground/60">
                  {getPurposeLabel(activity.payload.postPurpose)}
                </span>
              )}
              {isSuccessStory && (
                <div
                  className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--success-badge-bg)",
                    color: "var(--success-badge-text)",
                  }}
                >
                  <Trophy className="h-3 w-3" />
                  {activity.payload.postOutcome === "owner_found"
                    ? "เจอเจ้าของแล้ว"
                    : "มีบ้านใหม่แล้ว"}
                </div>
              )}
            </div>
          </Link>
        ) : activity.type === "new_comment" ||
          activity.type === "comment_reply" ? (
          <Link href={linkHref} className="block group/link">
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 group-hover/link:bg-muted transition-colors">
              <p className="text-sm text-foreground/80 line-clamp-2">
                {activity.payload.commentContent}
              </p>
              {activity.type === "comment_reply" && (
                <div className="mt-1 flex items-center gap-1 text-xs text-foreground/50">
                  <ArrowRight className="h-3 w-3" />
                  <span>ตอบกลับ</span>
                </div>
              )}
            </div>
          </Link>
        ) : isPostActivity ? (
          <Link href={linkHref} className="block group/link">
            <h3 className="text-sm font-medium group-hover/link:text-primary transition-colors">
              {activity.payload.postTitle ?? "โพสต์ใหม่"}
            </h3>
            {isSuccessStory && (
              <div
                className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "var(--success-badge-bg)",
                  color: "var(--success-badge-text)",
                }}
              >
                <Trophy className="h-3 w-3" />
                {activity.payload.postOutcome === "owner_found"
                  ? "เจอเจ้าของแล้ว"
                  : "มีบ้านใหม่แล้ว"}
              </div>
            )}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function getPurposeLabel(purpose: string): string {
  switch (purpose) {
    case "lost_pet":
      return "ตามหาน้องหาย";
    case "rehome_pet":
      return "หาบ้านใหม่";
    case "community_cat":
      return "แมวจรจัด";
    default:
      return purpose;
  }
}
