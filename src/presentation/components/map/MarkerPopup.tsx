"use client";

import type { PetPost } from "@/domain/entities/pet-post";
import { Badge } from "@/presentation/components/ui";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import { ArrowRight, Clock, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Popup } from "react-map-gl/maplibre";

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

interface MarkerPopupProps {
  post: PetPost;
  onClose: () => void;
}

export function MarkerPopup({ post, onClose }: MarkerPopupProps) {
  const statusInfo = statusConfig[post.status];

  return (
    <Popup
      latitude={post.latitude}
      longitude={post.longitude}
      anchor="bottom"
      offset={20}
      closeOnClick={false}
      onClose={onClose}
      maxWidth="280px"
    >
      <div className="w-64 overflow-hidden rounded-xl bg-card">
        {/* Image */}
        {post.thumbnailUrl && (
          <div className="relative h-32 w-full bg-muted">
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="256px"
            />
            <div className="absolute left-2 top-2">
              <Badge variant={statusInfo.variant} size="sm">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {post.title}
          </h3>

          {/* Owner */}
          {post.owner && (
            <Link
              href={`/profile/${post.owner.profileId}`}
              className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-primary"
            >
              <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full bg-muted">
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

          <div className="flex flex-col gap-1">
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

          <Link
            href={`/pets/${post.id}`}
            className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
          >
            ดูรายละเอียด
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Popup>
  );
}
