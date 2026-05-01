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
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
  }
> = {
  new_post: {
    label: "โพสต์ใหม่",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  status_changed: {
    label: "มีคำตอบแล้ว",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  new_comment: {
    label: "ความคิดเห็นใหม่",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
  },
  comment_reply: {
    label: "ตอบกลับ",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
  like_milestone: {
    label: "ถูกใจ",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    icon: <Heart className="h-3.5 w-3.5" />,
  },
  badge_unlock: {
    label: "Badge ใหม่",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
  post_expiring_soon: {
    label: "ใกล้หมดอายุ",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

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
  const cardBorder = isSuccessStory
    ? "border-emerald-300 bg-gradient-to-br from-emerald-50/60 to-white"
    : `border-border ${config.borderColor}`;

  const linkHref = activity.payload.postId
    ? `/pets/${activity.payload.postId}`
    : "#";

  return (
    <div
      className={`${cardBase} ${cardBorder}`}
      style={{ animationDelay: `${index * 50}ms` }}
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
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color} ${config.bgColor}`}
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
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
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
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
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
