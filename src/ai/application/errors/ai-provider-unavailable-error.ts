/**
 * AI Provider Unavailable Error
 *
 * Thrown when the AI provider (e.g., Gemini) is temporarily unavailable
 * due to rate limiting, quota exhaustion, or service unavailability.
 *
 * This should map to HTTP 503 Service Unavailable.
 */

import { AppError } from "@/application/errors";

export class AIProviderUnavailableError extends AppError {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly retryAfterMs?: number
  ) {
    super(message, "AI_PROVIDER_UNAVAILABLE");
    this.name = "AIProviderUnavailableError";
  }
}
