/**
 * PetTypePresenter
 * Handles business logic for pet type operations
 * Receives repository via dependency injection
 * Following Clean Architecture pattern
 */

import type { IPetTypeRepository } from "@/application/repositories/IPetTypeRepository";
import type { PetType } from "@/domain/entities/pet-post";

export interface PetTypesResult {
  success: boolean;
  data?: PetType[];
  error?: string;
}

export interface SinglePetTypeResult {
  success: boolean;
  data?: PetType | null;
  error?: string;
}

/**
 * Presenter for pet type operations
 * ✅ Receives repository via constructor injection
 * ✅ Serves as the Single Source of Truth for API Routes
 */
export class PetTypePresenter {
  constructor(private readonly repository: IPetTypeRepository) {}

  // ============================================================
  // QUERY METHODS (For API Routes)
  // ============================================================

  /**
   * Get all active pet types
   * Used by /api/pet-types GET route
   */
  async getAll(): Promise<PetTypesResult> {
    try {
      const petTypes = await this.repository.getAll();
      return { success: true, data: petTypes };
    } catch (error) {
      console.error("Error getting pet types:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get pet types";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get single pet type by ID
   */
  async getById(id: string): Promise<SinglePetTypeResult> {
    try {
      const petType = await this.repository.getById(id);
      return { success: true, data: petType };
    } catch (error) {
      console.error("Error getting pet type:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get pet type";
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get single pet type by slug
   */
  async getBySlug(slug: string): Promise<SinglePetTypeResult> {
    try {
      const petType = await this.repository.getBySlug(slug);
      return { success: true, data: petType };
    } catch (error) {
      console.error("Error getting pet type by slug:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get pet type";
      return { success: false, error: errorMessage };
    }
  }
}
