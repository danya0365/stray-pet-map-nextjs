"use client";

import type { PetPost } from "@/domain/entities/pet-post";
import { FavoriteButton } from "@/presentation/components/favorites/FavoriteButton";
import { Badge } from "@/presentation/components/ui";
import { cn } from "@/presentation/lib/cn";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import { Clock, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.locale("th");

const statusConfig: Record<
  PetPost["status"],
  { label: string; variant: "success" | "warning" | "primary" | "danger" }
> = {
  available: { label: "น้องหาบ้าน", variant: "success" },
  pending: { label: "มีคนสนใจ", variant: "warning" },
  adopted: { label: "มีบ้านแล้ว", variant: "primary" },
  missing: { label: "ตามหาน้อง", variant: "danger" },
};

interface PetPostCardProps {
  post: PetPost;
  className?: string;
}

export function PetPostCard({ post, className }: PetPostCardProps) {
  const statusInfo = statusConfig[post.status];

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Image - Link to pet detail */}
      <Link
        href={`/pets/${post.id}`}
        className="relative aspect-4/3 overflow-hidden bg-muted"
      >
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {post.petType?.icon || "🐾"}
          </div>
        )}

        {/* Status badge */}
        <div className="absolute left-3 top-3">
          <Badge variant={statusInfo.variant} size="sm">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Pet type badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1">
          {post.petType && (
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              {post.petType.icon} {post.petType.name}
            </span>
          )}
        </div>

        {/* Favorite button */}
        <div className="absolute bottom-3 right-3">
          <FavoriteButton
            petPostId={post.id}
            size="sm"
            className="bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title - Link to pet detail */}
        <Link href={`/pets/${post.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
            {post.title}
          </h3>
        </Link>

        {/* Owner - Link to profile */}
        {post.owner && (
          <Link
            href={`/profile/${post.owner.profileId}`}
            className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted">
              {post.owner.avatarUrl &&
              (post.owner.avatarUrl.startsWith("http") ||
                post.owner.avatarUrl.startsWith("/")) ? (
                <Image
                  src={post.owner.avatarUrl}
                  alt={post.owner.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="h-full w-full p-0.5 text-muted-foreground" />
              )}
            </div>
            <span className="truncate">{post.owner.displayName}</span>
          </Link>
        )}

        <div className="mt-auto flex flex-col gap-1.5">
          {post.address && (
            <p className="flex items-center gap-1 text-xs text-foreground/50">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{post.address}</span>
            </p>
          )}

          <p className="flex items-center gap-1 text-xs text-foreground/40">
            <Clock className="h-3 w-3 shrink-0" />
            {dayjs(post.createdAt).fromNow()}
          </p>
        </div>
      </div>
    </div>
  );
}
