/**
 * Domain types for the Inquiry aggregate.
 *
 * Persistence-independent — no Prisma, no Next.js, no React.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type InquiryStatus = "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED";

export type InquiryType =
  | "PROPERTY_INTEREST"
  | "VALUATION_REQUEST"
  | "COOPERATION"
  | "GENERAL_CONTACT";

// ---------------------------------------------------------------------------
// Core inquiry data shape
// ---------------------------------------------------------------------------

export interface InquiryData {
  id: string;
  propertyId: string | null;
  agentId: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  type: InquiryType;
  status: InquiryStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export type CreateInquiryInput = {
  propertyId?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  type?: InquiryType;
};

export type UpdateInquiryInput = Partial<{
  agentId: string;
  status: InquiryStatus;
  notes: string;
}>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface InquiryFilters {
  status?: InquiryStatus;
  type?: InquiryType;
  agentId?: string;
  propertyId?: string;
}
