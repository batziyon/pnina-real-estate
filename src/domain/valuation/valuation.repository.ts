/**
 * Repository interface for the ValuationRequest aggregate.
 *
 * No Prisma imports. Infrastructure implements this contract.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  CreateValuationRequestInput,
  UpdateValuationRequestInput,
  ValuationRequestData,
  ValuationRequestFilters,
} from "./valuation.types";

export interface ValuationRequestRepository {
  /** Find a valuation request by ID. Returns null if not found. */
  findById(id: string): Promise<ValuationRequestData | null>;

  /** List valuation requests with optional filters and pagination. */
  findMany(
    filters: ValuationRequestFilters,
    pagination: PaginationParams
  ): Promise<{ data: ValuationRequestData[]; meta: PaginationMeta }>;

  /** Create a new valuation request (e.g. from the public contact form). */
  create(input: CreateValuationRequestInput): Promise<ValuationRequestData>;

  /** Update a valuation request's status or notes. */
  update(id: string, input: UpdateValuationRequestInput): Promise<ValuationRequestData>;

  /** Count valuation requests matching the given filters. */
  count(filters: ValuationRequestFilters): Promise<number>;

  /** Count new (unread) valuation requests — for admin dashboard badge. */
  countNew(): Promise<number>;
}
