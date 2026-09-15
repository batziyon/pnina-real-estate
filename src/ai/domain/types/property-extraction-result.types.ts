/**
 * Property Extraction Result Types
 *
 * These types represent AI extraction output BEFORE domain validation.
 * All fields are nullable/optional until validated.
 */

import type { DealType, PropertyType } from "@/domain/property/property.types";

/**
 * Field confidence metadata
 */
export interface FieldConfidence {
  /** Confidence score between 0 and 1 */
  confidence: number;
  /** Optional explanation for confidence level */
  reason?: string;
}

/**
 * Extracted field with confidence
 */
export interface ExtractedField<T> {
  value: T | null;
  confidence: FieldConfidence;
}

/**
 * Result of AI property extraction from free text
 */
export interface PropertyExtractionResult {
  // Core property fields
  title: ExtractedField<string>;
  description: ExtractedField<string>;
  dealType: ExtractedField<DealType>;
  propertyType: ExtractedField<PropertyType>;
  price: ExtractedField<string>;
  
  // Location (note: neighborhoodName is free text, needs resolution to neighborhoodId)
  neighborhoodName: ExtractedField<string>;
  address: ExtractedField<string>;
  
  // Property details
  rooms: ExtractedField<string>;
  area: ExtractedField<string>;
  floor: ExtractedField<number>;
  totalFloors: ExtractedField<number>;
  
  // Features (only if explicitly mentioned)
  parking: ExtractedField<boolean>;
  elevator: ExtractedField<boolean>;
  balcony: ExtractedField<boolean>;
  safeRoom: ExtractedField<boolean>;
  storage: ExtractedField<boolean>;
  airConditioning: ExtractedField<boolean>;
  accessible: ExtractedField<boolean>;
  furnished: ExtractedField<boolean>;
  
  // Metadata
  missingFields: string[]; // List of field names that were not extracted
  overallConfidence: number; // Overall extraction confidence 0-1
  
  // Provider metadata (for debugging/audit)
  metadata: {
    provider: string;
    model: string;
    extractedAt: Date;
  };
}
