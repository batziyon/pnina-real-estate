/**
 * Shared primitive types used across all layers.
 *
 * Keep this file minimal. Domain-specific types belong in src/domain/.
 * Do not import from infrastructure, Prisma, or React here.
 */

/** A branded string type for database record IDs. */
export type ID = string;

/** Generic server-action / use-case result wrapper. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Pagination input shared across list queries. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Pagination metadata returned alongside list results. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
