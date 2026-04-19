/**
 * AdoptionRequestPresenter
 * Handles business logic for adoption request operations
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type {
  AdoptionRequest,
  AdoptionRequestQueryResult,
  CreateAdoptionRequestPayload,
  IAdoptionRequestRepository,
} from "@/application/repositories/IAdoptionRequestRepository";
import type { PaginationMode } from "@/application/repositories/IPetPostRepository";

export interface CreateResult {
  success: boolean;
  data?: AdoptionRequest;
  error?: string;
  isDuplicate?: boolean;
}

export interface RequestsResult {
  success: boolean;
  data?: AdoptionRequestQueryResult;
  error?: string;
}

export interface CheckResult {
  success: boolean;
  hasRequested?: boolean;
  error?: string;
}

/**
 * Presenter for adoption request operations
 * ✅ Receives repository via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class AdoptionRequestPresenter {
  constructor(private readonly repository: IAdoptionRequestRepository) {}

  // ============================================================
  // WRITE METHODS (For API Routes)
  // ============================================================

  /**
   * Create a new adoption request
   * Used by /api/adoption-requests POST route
   */
  async create(payload: CreateAdoptionRequestPayload): Promise<CreateResult> {
    try {
      const request = await this.repository.create(payload);
      return { success: true, data: request };
    } catch (error) {
      console.error("Error creating adoption request:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create request";

      // Check for duplicate request
      const isDuplicate =
        errorMessage.includes("ส่งคำขอ") && errorMessage.includes("แล้ว");

      return {
        success: false,
        error: errorMessage,
        isDuplicate,
      };
    }
  }

  // ============================================================
  // QUERY METHODS (For API Routes)
  // ============================================================

  /**
   * Get adoption requests by post ID
   * Used by /api/adoption-requests GET route
   */
  async getByPostId(
    petPostId: string,
    pagination: PaginationMode,
  ): Promise<RequestsResult> {
    try {
      const requests = await this.repository.getByPostId(petPostId, pagination);
      return { success: true, data: requests };
    } catch (error) {
      console.error("Error getting adoption requests:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get requests";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get current user's adoption requests
   * Used by /api/adoption-requests/my-requests GET route
   */
  async getMyRequests(pagination: PaginationMode): Promise<RequestsResult> {
    try {
      const requests = await this.repository.getMyRequests(pagination);
      return { success: true, data: requests };
    } catch (error) {
      console.error("Error getting my adoption requests:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get requests";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if user has requested a specific pet post
   * Used by /api/adoption-requests/has-requested GET route
   */
  async hasRequested(petPostId: string): Promise<CheckResult> {
    try {
      const hasRequested = await this.repository.hasRequested(petPostId);
      return { success: true, hasRequested };
    } catch (error) {
      console.error("Error checking adoption request status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to check status";
      return { success: false, error: errorMessage };
    }
  }
}
