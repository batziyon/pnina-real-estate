/**
 * Repository interface for the PropertyInterest aggregate.
 *
 * Defines the persistence contract that the application layer depends on.
 * Infrastructure (Prisma) implements this interface — the domain and
 * application layers never import from @prisma/client directly.
 */

import type {
  PropertyInterestData,
  CreatePropertyInterestInput,
  UpdatePropertyInterestInput,
  PropertyInterestStatus,
} from "./property-interest.types";

export interface PropertyInterestRepository {
  /** Find a single property interest by its ID. Returns null if not found. */
  findById(id: string): Promise<PropertyInterestData | null>;

  /**
   * Find property interest by unique composite key.
   * Returns null if not found.
   */
  findByContactAndProperty(
    contactId: string,
    propertyId: string
  ): Promise<PropertyInterestData | null>;

  /**
   * Find all property interests for a specific contact.
   * Ordered by createdAt DESC (newest first).
   */
  findByContactId(contactId: string): Promise<PropertyInterestData[]>;

  /**
   * Find all property interests for a specific property.
   * Optionally filter by status.
   * Ordered by createdAt DESC (newest first).
   */
  findByPropertyId(
    propertyId: string,
    statusFilter?: PropertyInterestStatus
  ): Promise<PropertyInterestData[]>;

  /**
   * Create a new property interest.
   * Throws unique constraint error if (contactId, propertyId) already exists.
   */
  create(input: CreatePropertyInterestInput): Promise<PropertyInterestData>;

  /**
   * Update an existing property interest.
   * Typically used to change status or notes.
   */
  update(
    id: string,
    input: UpdatePropertyInterestInput
  ): Promise<PropertyInterestData>;

  /**
   * Hard-delete a property interest.
   * Use sparingly — prefer updating status to NOT_INTERESTED.
   */
  delete(id: string): Promise<void>;

  /**
   * Count interests for a specific property, optionally filtered by status.
   */
  countByProperty(
    propertyId: string,
    statusFilter?: PropertyInterestStatus
  ): Promise<number>;
}
