/**
 * Repository interface for the ContactNote aggregate.
 *
 * No Prisma imports. Infrastructure implements this contract.
 */

import type {
  ContactNoteData,
  CreateContactNoteRepositoryInput,
  UpdateContactNoteInput,
  ContactNoteFilters,
} from "./contact-note.types";

export interface ContactNoteRepository {
  /** Find a contact note by ID. Returns null if not found. */
  findById(id: string): Promise<ContactNoteData | null>;

  /** List contact notes with filters. */
  findMany(filters: ContactNoteFilters): Promise<ContactNoteData[]>;

  /** List contact notes for a specific contact, ordered by creation date (newest first). */
  findByContactId(contactId: string): Promise<ContactNoteData[]>;

  /** Create a new contact note. */
  create(input: CreateContactNoteRepositoryInput): Promise<ContactNoteData>;

  /** Update a contact note's content. */
  update(id: string, input: UpdateContactNoteInput): Promise<ContactNoteData>;

  /** Delete a contact note. */
  delete(id: string): Promise<void>;

  /** Count notes for a contact. */
  countByContactId(contactId: string): Promise<number>;
}
