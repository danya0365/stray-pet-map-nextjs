/**
 * ApiReportRepository
 * Implements IReportRepository using API calls
 *
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No Supabase credentials exposed to client
 * ✅ Calls go through Next.js API routes
 */

"use client";

import type {
  CreateReportParams,
  IReportRepository,
  Report,
  ReportQueryResult,
} from "@/application/repositories/IReportRepository";
import type { PaginationMode } from "@/application/repositories/IPetPostRepository";

export class ApiReportRepository implements IReportRepository {
  private baseUrl = "/api/reports";

  async create(params: CreateReportParams): Promise<Report> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถส่งรายงานได้");
    }

    return res.json();
  }

  async getMyReports(
    pagination?: PaginationMode,
  ): Promise<ReportQueryResult> {
    const params = new URLSearchParams();

    if (pagination) {
      if (pagination.type === "offset") {
        params.set("paginationType", "offset");
        params.set("page", String(pagination.page));
        params.set("perPage", String(pagination.perPage));
      } else {
        params.set("paginationType", "cursor");
        if (pagination.cursor) {
          params.set("cursor", pagination.cursor);
        }
        params.set("limit", String(pagination.limit ?? 20));
      }
    }

    const res = await fetch(`${this.baseUrl}?${params.toString()}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถโหลดรายงานได้");
    }

    return res.json();
  }

  async hasReported(petPostId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/check?petPostId=${petPostId}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "ไม่สามารถตรวจสอบสถานะได้");
    }

    const data = await res.json();
    return data.hasReported ?? false;
  }
}
