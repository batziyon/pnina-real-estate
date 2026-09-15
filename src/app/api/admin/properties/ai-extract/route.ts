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
import { UnauthorizedError, EntityNotFoundError } from "@/application/errors";
import { AIExtractionError } from "@/ai/application/errors/ai-extraction-error";
import { AIValidationError } from "@/ai/application/errors/ai-validation-error";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and authorize
    const actor = await requireAuth();

    if (actor.role !== "ADMIN" && actor.role !== "AGENT") {
      return NextResponse.json(
        { error: "רק מנהלים וסוכנים מורשים להשתמש ביצירת נכס באמצעות AI" },
        { status: 403 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = aiExtractRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "נתונים לא תקינים",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { text } = validation.data;

    // 3. Call use case
    const result = await useCases.ai.createPropertyFromText.execute({
      text,
      actor,
    });

    // 4. Return structured result
    return NextResponse.json(
      {
        success: true,
        property: result.property,
        extraction: result.extraction,
        warnings: result.warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[AI Extract API] Error:", error);

    // AI-specific errors
    if (error instanceof AIExtractionError) {
      return NextResponse.json(
        {
          error: "שגיאה בחילוץ נתונים באמצעות AI",
          message: error.message,
          details: error.details,
        },
        { status: 422 }
      );
    }

    if (error instanceof AIValidationError) {
      return NextResponse.json(
        {
          error: "הנתונים שחולצו אינם תקינים",
          message: error.message,
          validationErrors: error.validationErrors,
        },
        { status: 422 }
      );
    }

    // Application errors
    if (error instanceof UnauthorizedError || error instanceof EntityNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error instanceof UnauthorizedError ? 401 : 404 }
      );
    }

    // Unknown errors
    return NextResponse.json(
      { error: "שגיאה פנימית בשרת" },
      { status: 500 }
    );
  }
}
