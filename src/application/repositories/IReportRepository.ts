/**
 * IReportRepository
 * Repository interface for reporting inappropriate content
 * Following Clean Architecture - Application layer
 */

import type { PaginationMode } from "@/domain/types/pagination";
import type { Database } from "@/domain/types/supabase";

export type ReportReason = Database["public"]["Enums"]["report_reason"];
export type ReportStatus = Database["public"]["Enums"]["report_status"];

export interface CreateReportParams {
  petPostId: string;
  reason: ReportReason;
  description?: string;
}

export interface Report {
  id: string;
  reporterProfileId: string;
  petPostId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

// ============================================================================
// QUERY RESULTS
// ============================================================================

export interface ReportQueryResult {
  data: Report[];
  total: number;
  page?: number;
  perPage?: number;
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface IReportRepository {
  /**
   * Create a new report
   */
  create(params: CreateReportParams): Promise<Report>;

  /**
   * Get reports by the current user (รองรับทั้ง offset และ cursor pagination)
   * @param pagination - รูปแบบ pagination (offset สำหรับ admin, cursor สำหรับ frontend)
   */
  getMyReports(pagination?: PaginationMode): Promise<ReportQueryResult>;

  /**
   * Check if user has already reported a post
   */
  hasReported(petPostId: string): Promise<boolean>;
}
