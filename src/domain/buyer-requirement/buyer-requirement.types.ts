/**
 * Domain types for the BuyerRequirement aggregate.
 *
 * Persistence-independent — no Prisma, no Next.js, no React.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

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

export type RequirementPreferenceType = "REQUIRED" | "PREFERRED";

// ---------------------------------------------------------------------------
// Neighborhood preference
// ---------------------------------------------------------------------------

export interface NeighborhoodPreference {
  neighborhoodId: string;
  preferenceType: RequirementPreferenceType;
  neighborhoodName?: string; // Optional - populated by repository
}

// ---------------------------------------------------------------------------
// Core buyer requirement data shape
// ---------------------------------------------------------------------------

export interface BuyerRequirementData {
  id: string;
  contactId: string;
  dealType: DealType;
  propertyType: PropertyType | null;
  minRooms: number | null;
  maxRooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  
  // Enhanced fields (PHASE 2)
  minFloor: number | null;
  maxFloor: number | null;
  requiresElevator: boolean;
  requiresParking: boolean;
  requiresBalcony: boolean;
  requiresSafeRoom: boolean;
  accessibilityRequired: boolean;
  renovationPreference: string | null;
  newConstructionPreference: boolean | null;
  moveInTimeframe: string | null;
  
  notes: string | null;
  active: boolean;
  neighborhoods: NeighborhoodPreference[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export type CreateBuyerRequirementInput = {
  contactId: string;
  dealType: DealType;
  propertyType?: PropertyType | null;
  minRooms?: number | null;
  maxRooms?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  
  // Enhanced fields (PHASE 2)
  minFloor?: number | null;
  maxFloor?: number | null;
  requiresElevator?: boolean;
  requiresParking?: boolean;
  requiresBalcony?: boolean;
  requiresSafeRoom?: boolean;
  accessibilityRequired?: boolean;
  renovationPreference?: string | null;
  newConstructionPreference?: boolean | null;
  moveInTimeframe?: string | null;
  
  notes?: string | null;
  neighborhoods: Array<{
    neighborhoodId: string;
    preferenceType: RequirementPreferenceType;
  }>;
};

export type UpdateBuyerRequirementInput = Partial<{
  dealType: DealType;
  propertyType: PropertyType | null;
  minRooms: number | null;
  maxRooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  
  // Enhanced fields (PHASE 2)
  minFloor: number | null;
  maxFloor: number | null;
  requiresElevator: boolean;
  requiresParking: boolean;
  requiresBalcony: boolean;
  requiresSafeRoom: boolean;
  accessibilityRequired: boolean;
  renovationPreference: string | null;
  newConstructionPreference: boolean | null;
  moveInTimeframe: string | null;
  
  notes: string | null;
  active: boolean;
  neighborhoods: Array<{
    neighborhoodId: string;
    preferenceType: RequirementPreferenceType;
  }>;
}>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface BuyerRequirementFilters {
  contactId?: string;
  active?: boolean;
  dealType?: DealType;
}
