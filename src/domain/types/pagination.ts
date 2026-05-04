/**
 * Pagination Types
 * Shared pagination types used across the application
 * Following Clean Architecture - Domain layer
 */

export interface OffsetPagination {
  type: "offset";
  page: number;
  perPage: number;
}

export interface CursorPagination {
  type: "cursor";
  cursor?: string;
  limit: number;
}

export type PaginationMode = OffsetPagination | CursorPagination;
