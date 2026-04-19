/**
 * SupabaseReportRepository
 * Supabase implementation for report operations
 * Following Clean Architecture - Infrastructure layer
 */

import type {
  CreateReportParams,
  IReportRepository,
  Report,
  ReportQueryResult,
} from "@/application/repositories/IReportRepository";
import type { PaginationMode } from "@/domain/types/pagination";
import type { Database } from "@/domain/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type ReportRow = Database["public"]["Tables"]["reports"]["Row"];

export class SupabaseReportRepository implements IReportRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(params: CreateReportParams): Promise<Report> {
    // Get current user - reporter_profile_id is set by RLS
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to create a report");
    }

    const { data, error } = await this.supabase
      .from("reports")
      .insert({
        pet_post_id: params.petPostId,
        reporter_profile_id: user.id,
        reason: params.reason,
        description: params.description || "",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }

    return this.mapToDomain(data as ReportRow);
  }

  async getMyReports(pagination?: PaginationMode): Promise<ReportQueryResult> {
    // Base query
    let query = this.supabase
      .from("reports")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    const isPaginated = pagination && pagination.type;

    if (isPaginated && pagination.type === "offset") {
      // Offset pagination (for admin)
      const { page, perPage } = pagination;
      const offset = (page - 1) * perPage;

      const { data, error, count } = await query.range(
        offset,
        offset + perPage - 1,
      );

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      const reports = (data ?? []).map((row) =>
        this.mapToDomain(row as ReportRow),
      );
      const total = count ?? 0;
      const hasMore = offset + reports.length < total;

      return {
        data: reports,
        total,
        hasMore,
        page,
        perPage,
      };
    } else if (isPaginated && pagination.type === "cursor") {
      // Cursor pagination (for frontend load more)
      const { cursor, limit = 20 } = pagination;

      if (cursor) {
        const decodedCursor = this.decodeCursor(cursor);
        query = query.lt("created_at", decodedCursor);
      }

      // Fetch one extra to determine hasMore
      const { data, error, count } = await query.limit(limit + 1);

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      const slicedData = (data ?? []).slice(0, limit);
      const reports = slicedData.map((row) =>
        this.mapToDomain(row as ReportRow),
      );
      const total = count ?? 0;
      const hasMore = (data ?? []).length > limit;

      let nextCursor: string | null = null;
      if (hasMore && slicedData.length > 0) {
        const lastCreatedAt = slicedData[slicedData.length - 1].created_at;
        if (lastCreatedAt) {
          nextCursor = this.encodeCursor(lastCreatedAt);
        }
      }

      return {
        data: reports,
        total,
        hasMore,
        nextCursor,
      };
    } else {
      // No pagination - fetch all (backward compatibility)
      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
      }

      const reports = (data ?? []).map((row) =>
        this.mapToDomain(row as ReportRow),
      );
      const total = count ?? 0;

      return {
        data: reports,
        total,
        hasMore: false,
      };
    }
  }

  // Helper: Encode cursor
  private encodeCursor(createdAt: string): string {
    return Buffer.from(createdAt).toString("base64url");
  }

  // Helper: Decode cursor
  private decodeCursor(cursor: string): string {
    return Buffer.from(cursor, "base64url").toString("utf-8");
  }

  async hasReported(petPostId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("reports")
      .select("id")
      .eq("pet_post_id", petPostId)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check report status: ${error.message}`);
    }

    return data && data.length > 0;
  }

  private mapToDomain(row: ReportRow): Report {
    return {
      id: row.id,
      reporterProfileId: row.reporter_profile_id,
      petPostId: row.pet_post_id,
      reason: row.reason,
      description: row.description || "",
      status: row.status,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at || "",
    };
  }
}
