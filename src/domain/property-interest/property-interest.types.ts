/**
 * Domain types for the PropertyInterest aggregate.
 *
 * These types are persistence-independent. They must NOT import from:
 * - @prisma/client
 * - src/generated/prisma
 * - Next.js
 * - React
 *
 * PropertyInterest represents an ongoing CRM relationship between a Contact and a Property.
 * It is intentionally separate from Inquiry:
 * - Inquiry = communication/event history
 * - PropertyInterest = current CRM relationship/state
 */

// ---------------------------------------------------------------------------
// Enums (mirrored from schema, kept independent of Prisma)
// ---------------------------------------------------------------------------

export type PropertyInterestStatus =
  | "INTERESTED"
  | "WAITING"
  | "CONTACTED"
  | "NOT_INTERESTED";

export type PropertyInterestSource =
  | "INQUIRY"
  | "AGENT_ADDED"
  | "REQUIREMENT_MATCH"
  | "WEBSITE";

// ---------------------------------------------------------------------------
// Core property interest data shape
// ---------------------------------------------------------------------------

export interface PropertyInterestData {
  id: string;
  contactId: string;
  propertyId: string;
  status: PropertyInterestStatus;
  source: PropertyInterestSource;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  // NOTE: updatedAt is NOT a semantic "contacted date"
  // It changes on any update (status, notes, etc.)
  // If contacted date tracking is needed, add: contactedAt: Date | null
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export interface CreatePropertyInterestInput {
  contactId: string;
  propertyId: string;
  source: PropertyInterestSource;
  status?: PropertyInterestStatus; // defaults to INTERESTED
  notes?: string | null;
}

export interface UpdatePropertyInterestInput {
  status?: PropertyInterestStatus;
  notes?: string | null;
}
