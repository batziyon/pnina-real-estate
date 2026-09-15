/**
 * Zod Schema for AI Extraction Output
 *
 * Validates the raw AI response before it becomes a PropertyExtractionResult.
 * This is the security boundary between untrusted AI output and our domain.
 */

import { z } from "zod";

const DealTypeEnum = z.enum(["SALE", "RENT"]);
const PropertyTypeEnum = z.enum([
  "APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "DUPLEX",
  "STUDIO", "OFFICE", "COMMERCIAL", "LAND", "OTHER",
]);

const FieldConfidenceSchema = z.object({
  confidence: z.number().min(0).max(1),
  reason: z.string().optional(),
});

function extractedField<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema.nullable(),
    confidence: FieldConfidenceSchema,
  });
}

export const PropertyExtractionResultSchema = z.object({
  title: extractedField(z.string()),
  description: extractedField(z.string()),
  dealType: extractedField(DealTypeEnum),
  propertyType: extractedField(PropertyTypeEnum),
  price: extractedField(z.string()),
  
  neighborhoodName: extractedField(z.string()),
  address: extractedField(z.string()),
  
  rooms: extractedField(z.string()),
  area: extractedField(z.string()),
  floor: extractedField(z.number().int()),
  totalFloors: extractedField(z.number().int()),
  
  parking: extractedField(z.boolean()),
  elevator: extractedField(z.boolean()),
  balcony: extractedField(z.boolean()),
  safeRoom: extractedField(z.boolean()),
  storage: extractedField(z.boolean()),
  airConditioning: extractedField(z.boolean()),
  accessible: extractedField(z.boolean()),
  furnished: extractedField(z.boolean()),
  
  missingFields: z.array(z.string()),
  overallConfidence: z.number().min(0).max(1),
  
  metadata: z.object({
    provider: z.string(),
    model: z.string(),
    extractedAt: z.date(),
  }),
});

export type PropertyExtractionResultInput = z.infer<typeof PropertyExtractionResultSchema>;
