/**
 * AI Extraction Error
 *
 * Thrown when AI property extraction fails.
 */

import { AppError } from "@/application/errors";

export class AIExtractionError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly details?: Record<string, unknown>
  ) {
    super(message, "AI_EXTRACTION_ERROR");
    this.name = "AIExtractionError";
  }
}
