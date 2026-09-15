/**
 * AI Property Extractor Interface
 *
 * Provider-independent abstraction for extracting structured property data
 * from free-text input.
 *
 * This interface must NOT be implemented directly by domain or application layers.
 * Only infrastructure providers implement this interface.
 */

import type { PropertyExtractionResult } from "../types/property-extraction-result.types";

export interface AIPropertyExtractor {
  /**
   * Extract structured property information from Hebrew free text.
   *
   * @param freeText - User-provided Hebrew property description
   * @returns Structured property data with confidence scores
   * @throws AIExtractionError if extraction fails
   */
  extractFromText(freeText: string): Promise<PropertyExtractionResult>;
}
