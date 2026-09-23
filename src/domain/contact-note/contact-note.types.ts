/**
 * Domain types for ContactNote aggregate.
 *
 * Persistence-independent — no Prisma, no Next.js, no React.
 */

// ---------------------------------------------------------------------------
// Core contact note data shape
// ---------------------------------------------------------------------------

export interface ContactNoteData {
  id: string;
  contactId: string;
  propertyId: string | null;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Optional enriched data (when fetched with relations)
  author?: {
    id: string;
    name: string;
    email: string;
  };
  property?: {
    id: string;
    title: string;
  };
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

/** Input for creating a contact note (authorId comes from actor context) */
export type CreateContactNoteInput = {
  contactId: string;
  propertyId?: string | null;
  content: string;
};

/** Internal input for repository create (includes authorId) */
export type CreateContactNoteRepositoryInput = CreateContactNoteInput & {
  authorId: string;
};

export type UpdateContactNoteInput = {
  content: string;
};

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface ContactNoteFilters {
  contactId?: string;
  propertyId?: string;
  authorId?: string;
}
