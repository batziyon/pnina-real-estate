/**
 * Domain types for the Property aggregate.
 *
 * These types are persistence-independent. They must NOT import from:
 * - @prisma/client
 * - src/generated/prisma
 * - Next.js
 * - React
 *
 * Geographic model: Jerusalem-only brokerage.
 * Properties are located by Neighborhood (FK), not by a free-text city field.
 */

// ---------------------------------------------------------------------------
// Enums (mirrored from schema, kept independent of Prisma)
// ---------------------------------------------------------------------------

export type PropertyStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "ARCHIVED";

export type DealType = "SALE" | "RENT";

export type PropertyType =
  | "APARTMENT"
  | "PENTHOUSE"
  | "HOUSE"
  | "VILLA"
  | "DUPLEX"
  | "STUDIO"
  | "OFFICE"
  | "COMMERCIAL"
  | "LAND"
  | "OTHER";

// ---------------------------------------------------------------------------
// Value objects
// ---------------------------------------------------------------------------

/** Boolean feature flags for a property. */
export interface PropertyFeatures {
  parking: boolean;
  elevator: boolean;
  balcony: boolean;
  safeRoom: boolean;
  storage: boolean;
  airConditioning: boolean;
  accessible: boolean;
  furnished: boolean;
}

export interface PropertyImageData {
  id: string;
  propertyId: string;
  storageKey: string | null;
  url: string;
  alt: string | null;
  sortOrder: number;
  isMain: boolean;
  createdAt: Date;
}

export interface PropertyVideoData {
  id: string;
  propertyId: string;
  url: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Core property data shape
// ---------------------------------------------------------------------------

export interface PropertyData extends PropertyFeatures {
  id: string;
  title: string;
  description: string | null;
  dealType: DealType;
  propertyType: PropertyType;
  /** Stored as string to avoid floating-point precision issues across layers. */
  price: string;
  /** FK to Neighborhood — the sole geographic locator in this system. */
  neighborhoodId: string;
  address: string | null;
  /** e.g. 3.5 rooms — stored as string from Decimal */
  rooms: string | null;
  /** Square metres — stored as string from Decimal */
  area: string | null;
  floor: number | null;
  totalFloors: number | null;
  status: PropertyStatus;
  agentId: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export type CreatePropertyInput = Omit<PropertyData, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: PropertyStatus;
};

export type UpdatePropertyInput = Partial<
  Omit<PropertyData, "id" | "createdAt" | "updatedAt">
>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface PropertyFilters {
  status?: PropertyStatus;
  dealType?: DealType;
  propertyType?: PropertyType;
  neighborhoodId?: string;
  agentId?: string;
  projectId?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string; // Text search across title, description, address
}
