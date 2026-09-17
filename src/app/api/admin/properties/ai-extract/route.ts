/**
 * AI Property Extraction API Route
 *
 * POST /api/admin/properties/ai-extract
 *
 * Accepts free-text property description and returns structured property draft.
 *
 * Security:
 * - Requires authentication
 * - Only ADMIN and AGENT roles can use AI extraction
 * - agentId is derived from authenticated actor (never from AI)
 * - Result is always DRAFT status (never published automatically)
 *
 * Flow:
 * 1. Authenticate actor
 * 2. Validate request body (Zod)
 * 3. Call CreatePropertyFromAIUseCase
 * 4. Return structured extraction result with confidence scores
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { aiExtractRequestSchema } from "@/validations/ai-extract-request.schema";
import {
  UnauthorizedError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleError
} from "@/application/errors";
import { AIExtractionError } from "@/ai/application/errors/ai-extraction-error";
import { AIValidationError } from "@/ai/application/errors/ai-validation-error";
import { AIProviderUnavailableError } from "@/ai/application/errors/ai-provider-unavailable-error";

export async function POST(request: NextRequest) {
  console.log("\n========== POST /api/admin/properties/ai-extract ==========");
  
  try {
    // STEP 1 SESSION VERIFICATION LOGGING
    const actor = await requireAuth();
    console.log("✓ Session actor verified:");
    console.log("  - id:    ", actor.id);
    console.log("  - email: ", actor.email);
    console.log("  - role:  ", actor.role);
    console.log("Expected ID after fresh login: cmu5p56oa001lu8u4ady241vk");

    if (actor.role !== "ADMIN" && actor.role !== "AGENT") {
      console.error("Authorization failed: role not allowed");
      return NextResponse.json(
        { error: "רק מנהלים וסוכנים מורשים להשתמש ביצירת נכס באמצעות AI" },
        { status: 403 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    console.log("Request body length:", body.text?.length || 0);
    
    const validation = aiExtractRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation failed:", validation.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: "נתונים לא תקינים",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { text } = validation.data;
    console.log("Starting AI extraction for text (first 100 chars):", text.substring(0, 100));

    // 3. Call use case
    console.log("Calling CreatePropertyFromAIUseCase...");
    const result = await useCases.ai.createPropertyFromText.execute({
      text,
      actor,
    });

    console.log("✓ AI extraction succeeded");
    console.log("Property created:", !!result.property);
    console.log("Warnings:", result.warnings.length);
    console.log("================================================\n");

    // 4. Return structured result
    // Note: property may be null if neighborhood was not provided or not resolvable
    return NextResponse.json(
      {
        success: true,
        property: result.property,
        extraction: result.extraction,
        warnings: result.warnings,
      },
      { status: result.property ? 201 : 200 }
    );
  } catch (error) {
    console.error("\n✗ AI Extract API ERROR:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    if (error && typeof error === 'object' && 'cause' in error) {
      console.error("Error cause:", error.cause);
    }
    console.error("================================================\n");

    // AI provider unavailable (503/429 from Gemini)
    if (error instanceof AIProviderUnavailableError) {
      return NextResponse.json(
        {
          error: "השירות של ה-AI אינו זמין כרגע. נסי שוב בעוד כמה דקות.",
          code: "AI_PROVIDER_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    // AI validation errors (invalid output from AI)
    if (error instanceof AIValidationError) {
      return NextResponse.json(
        {
          error: "הנתונים שחולצו אינם תקינים",
          message: error.message,
          code: "AI_VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    // AI extraction errors (other AI-related failures)
    if (error instanceof AIExtractionError) {
      // Check if this is actually a provider unavailability that wasn't caught
      const isProviderError = isProviderUnavailabilityError(error.cause);
      if (isProviderError) {
        return NextResponse.json(
          {
            error: "השירות של ה-AI אינו זמין כרגע. נסי שוב בעוד כמה דקות.",
            code: "AI_PROVIDER_UNAVAILABLE",
          },
          { status: 503 }
        );
      }

      // General AI extraction failure (configuration/unexpected)
      return NextResponse.json(
        {
          error: "שגיאה בחילוץ נתונים באמצעות AI",
          message: "אירעה שגיאה פנימית. אנא נסי שוב מאוחר יותר.",
          code: "AI_EXTRACTION_ERROR",
        },
        { status: 500 }
      );
    }

    // Application errors
    if (error instanceof UnauthorizedError || error instanceof EntityNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error instanceof UnauthorizedError ? 401 : 404 }
      );
    }

    // Application validation errors (neighborhood not found, business rule violations, etc.)
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          fields: error.fields,
          code: "VALIDATION_ERROR",
        },
        { status: 422 }
      );
    }

    // Business rule violations
    if (error instanceof BusinessRuleError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "BUSINESS_RULE_VIOLATION",
        },
        { status: 422 }
      );
    }

    // Unknown errors
    return NextResponse.json(
      { error: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
}

/**
 * Helper to detect provider unavailability from error cause chain
 */
function isProviderUnavailabilityError(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') {
    return false;
  }

  const err = cause as { status?: number; code?: number; message?: string };

  // Check for 503 or 429
  if (err.status === 503 || err.code === 503 || err.status === 429 || err.code === 429) {
    return true;
  }

  // Check for UNAVAILABLE or RESOURCE_EXHAUSTED in message
  if (err.message) {
    if (err.message.includes('"status":"UNAVAILABLE"') ||
        err.message.includes('"status":"RESOURCE_EXHAUSTED"')) {
      return true;
    }
  }

  return false;
}
