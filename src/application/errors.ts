/**
 * Application-level error types.
 *
 * These errors represent business-level failures, not infrastructure failures.
 * They must NOT contain database credentials, SQL, or Prisma internal details.
 *
 * Infrastructure errors (Prisma / pg) are caught in use cases and translated
 * into these typed errors before being surfaced to callers.
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ---------------------------------------------------------------------------
// Concrete error types
// ---------------------------------------------------------------------------

/** A requested record was not found. */
export class EntityNotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found.`, "ENTITY_NOT_FOUND");
    this.name = "EntityNotFoundError";
  }
}

/** Input failed schema or domain validation. */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string>
  ) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

/** A domain business rule was violated (e.g. invalid status transition). */
export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, "BUSINESS_RULE_VIOLATION");
    this.name = "BusinessRuleError";
  }
}

/** The caller is not authorized to perform this operation. */
export class UnauthorizedError extends AppError {
  constructor(message = "You are not authorized to perform this action.") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
