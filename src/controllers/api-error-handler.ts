/**
 * API error handling utilities.
 *
 * Maps application-level errors to HTTP status codes and clean JSON responses.
 * Never exposes stack traces, Prisma internals, or secrets.
 */

import { NextResponse } from "next/server";
import {
  EntityNotFoundError,
  ValidationError,
  BusinessRuleError,
  UnauthorizedError,
  isAppError,
} from "@/application/errors";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string> | string[];
  };
}

/**
 * Maps application errors to HTTP responses.
 * Unknown errors become 500 without exposing internals.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Known application errors
  if (isAppError(error)) {
    if (error instanceof EntityNotFoundError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 404 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.fields,
          },
        },
        { status: 400 }
      );
    }

    if (error instanceof BusinessRuleError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 409 }
      );
    }

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 401 }
      );
    }
  }

  // Unknown error — log it server-side but don't expose details to client
  console.error("[API Error]", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    },
    { status: 500 }
  );
}
