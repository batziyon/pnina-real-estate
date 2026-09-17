/**
 * PropertyStatusHistory repository interface.
 *
 * Defines persistence operations for status history records.
 * Infrastructure layer implements this interface.
 */

import type {
  PropertyStatusHistoryData,
  CreateStatusHistoryInput,
} from "./property-status-history.types";

export interface PropertyStatusHistoryRepository {
  /**
   * Create a new status history record.
   */
  create(input: CreateStatusHistoryInput): Promise<PropertyStatusHistoryData>;

  /**
   * Find all status history records for a property, ordered by createdAt DESC.
   */
  findByPropertyId(propertyId: string): Promise<PropertyStatusHistoryData[]>;
}
