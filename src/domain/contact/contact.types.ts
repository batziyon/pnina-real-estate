/**
 * Domain types for the Contact aggregate.
 *
 * Persistence-independent — no Prisma, no Next.js, no React.
 */

// ---------------------------------------------------------------------------
// Core contact data shape
// ---------------------------------------------------------------------------

export interface ContactData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  assignedAgentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export type CreateContactInput = {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  assignedAgentId?: string;
};

export type UpdateContactInput = Partial<{
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  assignedAgentId: string | null;
}>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface ContactFilters {
  search?: string;
  assignedAgentId?: string;
}
