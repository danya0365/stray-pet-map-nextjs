/**
 * SupabaseReportRepository
 * Supabase implementation for report operations
 * Following Clean Architecture - Infrastructure layer
 */

import type {
  CreateReportParams,
  IReportRepository,
  Report,
} from "@/application/repositories/IReportRepository";
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

  async getMyReports(): Promise<Report[]> {
    const { data, error } = await this.supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return (data as ReportRow[]).map((row) => this.mapToDomain(row));
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
