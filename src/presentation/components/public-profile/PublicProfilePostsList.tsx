"use client";

import type { PetPost } from "@/domain/entities/pet-post";
import { Loader2, ChevronDown, FileText, MapPin, Calendar } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.locale("th");

interface PublicProfilePostsListProps {
  posts: PetPost[];
  totalCount: number;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "รอรับเลี้ยง", color: "text-emerald-600 bg-emerald-50" },
  pending: { label: "มีคนสนใจ", color: "text-amber-600 bg-amber-50" },
  adopted: { label: "มีบ้านแล้ว", color: "text-blue-600 bg-blue-50" },
  missing: { label: "ตามหาน้อง", color: "text-red-600 bg-red-50" },
};

const purposeConfig: Record<string, { label: string; color: string }> = {
  adoption: { label: "หาบ้าน", color: "text-emerald-600 bg-emerald-50" },
  missing: { label: "ตามหา", color: "text-red-600 bg-red-50" },
  found: { label: "พบแล้ว", color: "text-blue-600 bg-blue-50" },
};

export function PublicProfilePostsList({
  posts,
  totalCount,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = "ยังไม่มีโพสต์",
}: PublicProfilePostsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
            <div className="flex gap-3">
              <div className="h-20 w-20 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-foreground/40" />
        </div>
        <p className="text-sm text-foreground/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        <FileText className="h-4 w-4" />
        <span>{totalCount} โพสต์</span>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/pet/${post.id}`}
            className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {post.thumbnailUrl ? (
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-foreground/30">
                    <FileText className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium truncate text-sm">{post.title}</h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      purposeConfig[post.purpose]?.color ??
                      "text-gray-600 bg-gray-50"
                    }`}
                  >
                    {purposeConfig[post.purpose]?.label ?? post.purpose}
                  </span>
                </div>

                <p className="mt-1 text-xs text-foreground/60 line-clamp-1">
                  {post.description || "ไม่มีคำอธิบาย"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                  {post.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {post.province || post.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dayjs(post.createdAt).fromNow()}
                  </span>
                </div>

                <div className="mt-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusConfig[post.status]?.color ??
                      "text-gray-600 bg-gray-50"
                    }`}
                  >
                    {statusConfig[post.status]?.label ?? post.status}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="pt-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังโหลด...</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>โหลดเพิ่ม ({totalCount - posts.length} รายการ)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
