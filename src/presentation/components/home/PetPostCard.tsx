"use client";

import type { PetPost } from "@/domain/entities/pet-post";
import { Badge } from "@/presentation/components/ui";
import { cn } from "@/presentation/lib/cn";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.locale("th");

const statusConfig: Record<
  PetPost["status"],
  { label: string; variant: "success" | "warning" | "primary" | "danger" }
> = {
  available: { label: "รอรับเลี้ยง", variant: "success" },
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
    <Link
      href={`/pets/${post.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
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
        {post.petType && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              {post.petType.icon} {post.petType.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {post.title}
        </h3>

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
    </Link>
  );
}
