/**
 * Domain types for PropertyStatusHistory.
 *
 * These types are persistence-independent. They must NOT import from:
 * - @prisma/client
 * - src/generated/prisma
 * - Next.js
 * - React
 */

import type { PropertyStatus } from "../property/property.types";

// ---------------------------------------------------------------------------
// Enums (mirrored from schema, kept independent of Prisma)
// ---------------------------------------------------------------------------

export type StatusChangeReason =
  | "DEAL_FELL_THROUGH"
  | "TRANSACTION_COMPLETED"
  | "RENTAL_ENDED"
  | "OWNER_DECISION"
  | "PRICE_CHANGE"
  | "OTHER";

// ---------------------------------------------------------------------------
// Core status history data shape
// ---------------------------------------------------------------------------

export interface PropertyStatusHistoryData {
  id: string;
  propertyId: string;
  fromStatus: PropertyStatus | null;
  toStatus: PropertyStatus;
  reason: StatusChangeReason;
  notes: string | null;
  changedBy: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export interface CreateStatusHistoryInput {
  propertyId: string;
  fromStatus: PropertyStatus | null;
  toStatus: PropertyStatus;
  reason: StatusChangeReason;
  notes?: string | null;
  changedBy: string;
}
