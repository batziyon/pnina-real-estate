/**
 * BuyerRequirement Repository Interface — Domain Layer
 *
 * Persistence-independent contract.
 */

import type {
  BuyerRequirementData,
  CreateBuyerRequirementInput,
  UpdateBuyerRequirementInput,
  BuyerRequirementFilters,
} from "./buyer-requirement.types";
import type { PaginationParams, PaginationMeta } from "@/types";

export interface BuyerRequirementRepository {
  /**
   * Find a single buyer requirement by ID.
   * Returns null if not found.
   */
  findById(id: string): Promise<BuyerRequirementData | null>;

  /**
   * Find all buyer requirements for a specific contact.
   * Ordered by createdAt DESC (newest first).
   */
  findByContactId(contactId: string): Promise<BuyerRequirementData[]>;

  /**
   * Find many buyer requirements with filters and pagination.
   */
  findMany(
    filters: BuyerRequirementFilters,
    options: PaginationParams
  ): Promise<{ data: BuyerRequirementData[]; meta: PaginationMeta }>;

  /**
   * Create a new buyer requirement with neighborhood preferences.
   */
  create(input: CreateBuyerRequirementInput): Promise<BuyerRequirementData>;

  /**
   * Update an existing buyer requirement.
   * Neighborhoods can be replaced entirely if provided.
   */
  update(
    id: string,
    input: UpdateBuyerRequirementInput
  ): Promise<BuyerRequirementData>;

  /**
   * Soft-deactivate a buyer requirement.
   */
  deactivate(id: string): Promise<BuyerRequirementData>;

  /**
   * Count buyer requirements matching filters.
   */
  count(filters: BuyerRequirementFilters): Promise<number>;
}
