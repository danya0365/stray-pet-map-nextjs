"use client";

import type { AdoptionRequest } from "@/application/repositories/IAdoptionRequestRepository";
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CheckCircle2,
  ChevronDown,
  Inbox,
  Loader2,
  User,
  XCircle,
} from "lucide-react";

dayjs.extend(relativeTime);
dayjs.locale("th");

interface AdoptionRequestListProps {
  requests: AdoptionRequest[];
  totalCount: number;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
  isOwner?: boolean;
  processingId?: string | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "รอดำเนินการ", color: "text-amber-600 bg-amber-50" },
  approved: { label: "อนุมัติ", color: "text-emerald-600 bg-emerald-50" },
  rejected: { label: "ปฏิเสธ", color: "text-red-600 bg-red-50" },
};

export function AdoptionRequestList({
  requests,
  totalCount,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = "ยังไม่มีคำขอรับเลี้ยง",
  isOwner = false,
  processingId = null,
  onApprove,
  onReject,
}: AdoptionRequestListProps) {
  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-6 w-6 text-foreground/40" />
        </div>
        <p className="text-sm text-foreground/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-foreground/60">
        <Inbox className="h-4 w-4" />
        <span>{totalCount} คำขอรับเลี้ยง</span>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    ผู้ส่งคำขอ
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusConfig[request.status]?.color ??
                      "text-gray-600 bg-gray-50"
                    }`}
                  >
                    {statusConfig[request.status]?.label ?? request.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/60">
                  {request.message || "ไม่มีข้อความ"}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-foreground/50">
                  {request.contactPhone && (
                    <span>โทร: {request.contactPhone}</span>
                  )}
                  {request.contactLineId && (
                    <span>LINE: {request.contactLineId}</span>
                  )}
                </div>
                {isOwner && request.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={processingId === request.id}
                      onClick={() => onApprove?.(request.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200 disabled:opacity-50"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      อนุมัติ
                    </button>
                    <button
                      type="button"
                      disabled={processingId === request.id}
                      onClick={() => onReject?.(request.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      ปฏิเสธ
                    </button>
                  </div>
                )}
                <p className="mt-2 text-xs text-foreground/40">
                  {dayjs(request.createdAt).fromNow()}
                </p>
              </div>
            </div>
          </div>
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
                <span>โหลดเพิ่ม ({totalCount - requests.length} รายการ)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
