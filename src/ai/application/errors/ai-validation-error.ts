/**
 * AI Validation Error
 *
 * Thrown when AI output fails validation.
 */

import { AppError } from "@/application/errors";

export class AIValidationError extends AppError {
  constructor(
    message: string,
    public readonly validationErrors?: unknown
  ) {
    super(message, "AI_VALIDATION_ERROR");
    this.name = "AIValidationError";
  }
}
