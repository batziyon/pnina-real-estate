/**
 * Repository interface for the Contact aggregate.
 *
 * Defines the persistence contract that the application layer depends on.
 * Infrastructure (Prisma) implements this interface — the domain and
 * application layers never import from @prisma/client directly.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  ContactData,
  ContactFilters,
  CreateContactInput,
  UpdateContactInput,
} from "./contact.types";

export interface ContactRepository {
  /** Find a single contact by its ID. Returns null if not found. */
  findById(id: string): Promise<ContactData | null>;

  /** List contacts with optional filters and pagination. */
  findMany(
    filters: ContactFilters,
    pagination: PaginationParams
  ): Promise<{ data: ContactData[]; meta: PaginationMeta }>;

  /** Create a new contact record. Returns the created contact. */
  create(input: CreateContactInput): Promise<ContactData>;

  /** Update an existing contact. Returns the updated contact. */
  update(id: string, input: UpdateContactInput): Promise<ContactData>;

  /** Count contacts matching the given filters. */
  count(filters: ContactFilters): Promise<number>;
}
