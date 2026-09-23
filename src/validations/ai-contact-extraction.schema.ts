/**
 * AI Contact Extraction Zod Schema
 *
 * Validates the structured output from AI contact extraction.
 */

import { z } from "zod";

const ConfidenceScoreSchema = z.object({
  confidence: z.number().min(0).max(1),
  reason: z.string().optional(),
});

const ExtractedFieldSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema.nullable(),
    confidence: ConfidenceScoreSchema,
  });

export const ContactExtractionResultSchema = z.object({
  // Core fields
  name: ExtractedFieldSchema(z.string()),
  phone: ExtractedFieldSchema(z.string()),
  email: ExtractedFieldSchema(z.string()),
  
  // Classification
  source: ExtractedFieldSchema(
    z.enum(["WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "AGENT_NETWORK", "OTHER"]).nullable()
  ),
  stage: ExtractedFieldSchema(
    z.enum(["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "CONVERTED", "LOST"]).nullable()
  ),
  
  // Additional info
  notes: ExtractedFieldSchema(z.string()),
  interests: ExtractedFieldSchema(z.array(z.string())),
  
  // Metadata
  missingFields: z.array(z.string()),
  overallConfidence: z.number().min(0).max(1),
  
  metadata: z
    .object({
      provider: z.literal("gemini"),
      model: z.string(),
      extractedAt: z.coerce.date(),
    })
    .optional(),
});

export type ContactExtractionResultSchemaType = z.infer<typeof ContactExtractionResultSchema>;
