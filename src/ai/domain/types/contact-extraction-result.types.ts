/**
 * Contact Extraction Result Types
 *
 * Domain layer — structured result from AI contact extraction.
 */

export interface ConfidenceScore {
  confidence: number; // 0.0 - 1.0
  reason?: string;
}

export interface ExtractedField<T> {
  value: T | null;
  confidence: ConfidenceScore;
}

export interface ContactExtractionResult {
  // Core fields
  name: ExtractedField<string>;
  phone: ExtractedField<string>;
  email: ExtractedField<string>;
  
  // Classification
  source: ExtractedField<"WEBSITE" | "REFERRAL" | "SOCIAL_MEDIA" | "AGENT_NETWORK" | "OTHER" | null>;
  stage: ExtractedField<"NEW" | "CONTACTED" | "QUALIFIED" | "NURTURING" | "CONVERTED" | "LOST" | null>;
  
  // Additional info
  notes: ExtractedField<string>;
  interests: ExtractedField<string[]>; // Array of interest keywords
  
  // Metadata
  missingFields: string[];
  overallConfidence: number; // 0.0 - 1.0
  
  metadata?: {
    provider: "gemini";
    model: string;
    extractedAt: Date;
  };
}
