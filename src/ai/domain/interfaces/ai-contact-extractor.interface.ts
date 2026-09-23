/**
 * AI Contact Extractor Interface
 *
 * Domain layer — contract for AI-powered contact information extraction.
 */

import type { ContactExtractionResult } from "@/ai/domain/types/contact-extraction-result.types";

export interface AIContactExtractor {
  /**
   * Extract structured contact information from free-text.
   *
   * @param freeText - Unstructured text containing contact information
   * @returns Structured extraction result with confidence scores
   * @throws AIExtractionError on extraction failure
   * @throws AIValidationError on invalid AI output
   * @throws AIProviderUnavailableError on provider unavailability (503/429)
   */
  extractFromText(freeText: string): Promise<ContactExtractionResult>;
}
