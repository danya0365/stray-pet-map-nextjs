/**
 * ReportPresenter
 * Handles business logic for report operations
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type {
  CreateReportParams,
  IReportRepository,
  Report,
} from "@/application/repositories/IReportRepository";

export interface CreateReportResult {
  success: boolean;
  data?: Report;
  error?: string;
  hasAlreadyReported?: boolean;
}

export interface GetReportsResult {
  success: boolean;
  data?: Report[];
  error?: string;
}

export interface CheckReportResult {
  success: boolean;
  hasReported?: boolean;
  error?: string;
}

/**
 * Presenter for report operations
 * ✅ Receives repository via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class ReportPresenter {
  constructor(private readonly repository: IReportRepository) {}

  // ============================================================
  // WRITE METHODS (For API Routes)
  // ============================================================

  /**
   * Create a new report
   * Used by /api/reports POST route
   */
  async create(params: CreateReportParams): Promise<CreateReportResult> {
    try {
      // Check if user has already reported this post
      const hasReported = await this.repository.hasReported(params.petPostId);
      if (hasReported) {
        return {
          success: false,
          error: "คุณได้รายงานโพสต์นี้ไปแล้ว",
          hasAlreadyReported: true,
        };
      }

      const report = await this.repository.create(params);
      return { success: true, data: report };
    } catch (error) {
      console.error("Error creating report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create report";
      return { success: false, error: errorMessage };
    }
  }

  // ============================================================
  // QUERY METHODS (For API Routes)
  // ============================================================

  /**
   * Get current user's reports
   * Used by /api/reports GET route
   */
  async getMyReports(): Promise<GetReportsResult> {
    try {
      const reports = await this.repository.getMyReports();
      return { success: true, data: reports };
    } catch (error) {
      console.error("Error getting reports:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get reports";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if user has reported a post
   */
  async hasReported(petPostId: string): Promise<CheckReportResult> {
    try {
      const hasReported = await this.repository.hasReported(petPostId);
      return { success: true, hasReported };
    } catch (error) {
      console.error("Error checking report status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to check status";
      return { success: false, error: errorMessage };
    }
  }
}
