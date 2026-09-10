/**
 * Domain types for the ValuationRequest aggregate.
 *
 * No Prisma, no Next.js, no React.
 */

import type { PropertyType } from "@/domain/property/property.types";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type ValuationRequestStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "CLOSED";

// ---------------------------------------------------------------------------
// Core data shape
// ---------------------------------------------------------------------------

export interface ValuationRequestData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  neighborhoodId: string;
  address: string | null;
  propertyType: PropertyType | null;
  /** Stored as string from Decimal */
  rooms: string | null;
  /** Stored as string from Decimal */
  area: string | null;
  message: string | null;
  status: ValuationRequestStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type CreateValuationRequestInput = {
  name: string;
  phone: string;
  email?: string;
  neighborhoodId: string;
  address?: string;
  propertyType?: PropertyType;
  rooms?: string;
  area?: string;
  message?: string;
};

export type UpdateValuationRequestInput = Partial<{
  status: ValuationRequestStatus;
  notes: string;
}>;

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface ValuationRequestFilters {
  status?: ValuationRequestStatus;
  neighborhoodId?: string;
}
