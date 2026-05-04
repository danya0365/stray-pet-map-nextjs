"use client";

import type { ActivityItem, ActivityType } from "@/domain/entities/activity";
import { Avatar } from "@/presentation/components/ui";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ArrowRight,
  Bookmark,
  Heart,
  MessageCircle,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ShareIconButton } from "./ShareUpdateButton";

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
  }
> = {
  new_post: {
    label: "โพสต์ใหม่",
    color: "text-primary",
  },
  status_changed: {
    label: "มีคำตอบแล้ว",
    color: "text-green-500",
  },
  new_comment: {
    label: "ความคิดเห็น",
    color: "text-blue-500",
  },
  comment_reply: {
    label: "ตอบกลับ",
    color: "text-blue-500",
  },
  like_milestone: {
    label: "ถูกใจ",
    color: "text-rose-500",
  },
  badge_unlock: {
    label: "Badge",
    color: "text-amber-500",
  },
  post_expiring_soon: {
    label: "ใกล้หมดอายุ",
    color: "text-orange-500",
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

  const linkHref = activity.payload.postId
    ? `/pets/${activity.payload.postId}`
    : "#";
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${linkHref}`
      : linkHref;
  const shareText = activity.payload.postTitle
    ? `🐕 ${activity.payload.postTitle} บน StrayPetMap`
    : `อัปเดตล่าสุดจากชุมชน StrayPetMap`;

  return (
    <article
      className="group border-b border-border/60 px-4 py-4 transition-colors hover:bg-muted/20"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Tweet Header */}
      <div className="flex items-start gap-3">
        <Avatar
          src={activity.actor.avatarUrl}
          alt={activity.actor.displayName}
          name={activity.actor.displayName}
          className="h-10 w-10 shrink-0"
        />

        <div className="min-w-0 flex-1">
          {/* Name line */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="truncate font-semibold">
              {activity.actor.displayName}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              Lv.{activity.actor.level}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">·</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {dayjs(activity.occurredAt).fromNow()}
            </span>
            <span className={`ml-auto text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>

          {/* Content */}
          <div className="mt-1">
            {isPostActivity && activity.payload.postThumbnailUrl ? (
              <Link href={linkHref} className="block group/link">
                <p className="mb-2 text-[15px] leading-relaxed text-foreground">
                  {isSuccessStory
                    ? `🎉 ${activity.payload.postTitle ?? "โพสต์ใหม่"}`
                    : (activity.payload.postTitle ?? "โพสต์ใหม่")}
                </p>

                {/* Image card */}
                <div className="relative aspect-video w-full max-h-[320px] overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src={activity.payload.postThumbnailUrl}
                    alt={activity.payload.postTitle ?? "รูปโพสต์"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/link:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {activity.type === "new_post" &&
                    activity.payload.postPurpose && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {getPurposeLabel(activity.payload.postPurpose)}
                      </span>
                    )}
                  {isSuccessStory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                      <Trophy className="h-3 w-3" />
                      {activity.payload.postOutcome === "owner_found"
                        ? "เจอเจ้าของแล้ว"
                        : "มีบ้านใหม่แล้ว"}
                    </span>
                  )}
                </div>
              </Link>
            ) : activity.type === "new_comment" ||
              activity.type === "comment_reply" ? (
              <Link href={linkHref} className="block group/link">
                <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 group-hover/link:bg-muted/50 transition-colors">
                  <p className="text-[15px] leading-relaxed text-foreground">
                    {activity.payload.commentContent}
                  </p>
                  {activity.type === "comment_reply" && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                      <span>ตอบกลับโพสต์</span>
                    </div>
                  )}
                </div>
              </Link>
            ) : isPostActivity ? (
              <Link href={linkHref} className="block group/link">
                <p className="text-[15px] leading-relaxed text-foreground">
                  {isSuccessStory
                    ? `🎉 ${activity.payload.postTitle ?? "โพสต์ใหม่"}`
                    : (activity.payload.postTitle ?? "โพสต์ใหม่")}
                </p>
                {isSuccessStory && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                    <Trophy className="h-3 w-3" />
                    {activity.payload.postOutcome === "owner_found"
                      ? "เจอเจ้าของแล้ว"
                      : "มีบ้านใหม่แล้ว"}
                  </span>
                )}
              </Link>
            ) : activity.type === "badge_unlock" ? (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">
                    ปลดล็อก Badge: {activity.payload.badgeName ?? "ใหม่"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.payload.badgeDescription ?? ""}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Bar */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="group/comment flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-blue-500/10 hover:text-blue-500">
                <MessageCircle className="h-4 w-4 text-muted-foreground group-hover/comment:text-blue-500" />
              </button>
              <button className="group/heart flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-rose-500/10 hover:text-rose-500">
                <Heart className="h-4 w-4 text-muted-foreground group-hover/heart:text-rose-500" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {activity.payload.postId && (
                <ShareIconButton url={shareUrl} text={shareText} />
              )}
              <button className="group/book flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary">
                <Bookmark className="h-4 w-4 text-muted-foreground group-hover/book:text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
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
