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
  roles?: Array<{ role: ContactRoleType }>;
  
  // Enhanced contact information
  preferredName: string | null;
  secondaryPhone: string | null;
  secondaryEmail: string | null;
  preferredCommunication: string | null;
  
  // Current situation
  currentCity: string | null;
  currentNeighborhood: string | null;
  currentAddress: string | null;
  currentPropertyStatus: string | null;
  
  // Seller opportunity
  interestedInSelling: boolean | null;
  sellingTimeframe: string | null;
  sellingReason: string | null;
  valuationRequested: boolean;
  valuationCompleted: boolean;
  
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
  roles?: ContactRoleType[];
  assignedAgentId?: string;
  
  // Enhanced fields
  preferredName?: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  preferredCommunication?: string;
  
  // Current situation
  currentCity?: string;
  currentNeighborhood?: string;
  currentAddress?: string;
  currentPropertyStatus?: string;
  
  // Seller opportunity
  interestedInSelling?: boolean;
  sellingTimeframe?: string;
  sellingReason?: string;
};

export type UpdateContactInput = Partial<{
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  assignedAgentId: string | null;
  
  // Enhanced fields
  preferredName: string | null;
  secondaryPhone: string | null;
  secondaryEmail: string | null;
  preferredCommunication: string | null;
  
  // Current situation
  currentCity: string | null;
  currentNeighborhood: string | null;
  currentAddress: string | null;
  currentPropertyStatus: string | null;
  
  // Seller opportunity
  interestedInSelling: boolean | null;
  sellingTimeframe: string | null;
  sellingReason: string | null;
  valuationRequested: boolean;
  valuationCompleted: boolean;
}>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export type ContactRoleType = "BUYER" | "SELLER" | "RENTER" | "LANDLORD" | "INVESTOR" | "COLLABORATOR" | "OTHER";

export interface ContactFilters {
  search?: string;
  assignedAgentId?: string;
  role?: ContactRoleType;
  interestedInSelling?: boolean;
  hasActiveRequirement?: boolean;
  hasPropertyInterests?: boolean;
}
