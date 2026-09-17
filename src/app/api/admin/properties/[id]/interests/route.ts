/**
 * Admin Property Interests API
 *
 * GET  /api/admin/properties/[id]/interests - List interests for a property
 * POST /api/admin/properties/[id]/interests - Create new interest
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import {
  CreatePropertyInterestSchema,
  ListPropertyInterestsQuerySchema,
} from "@/validations/property-interest.schema";
import { ValidationError } from "@/application/errors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/properties/[id]/interests
 *
 * List all interests for a property, optionally filtered by status.
 * Authorization happens inside ListPropertyInterestsByPropertyUseCase.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params and query
    const { id: propertyId } = await context.params;
    const { searchParams } = new URL(request.url);
    const queryRaw = {
      status: searchParams.get("status") || undefined,
    };

    // 3. Validate query params
    const parsed = ListPropertyInterestsQuerySchema.safeParse(queryRaw);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "Invalid",
        ])
      );
      throw new ValidationError("Invalid query parameters.", fields);
    }

    // 4. Call use case (authorization happens inside)
    const interests = await useCases.propertyInterests.listByProperty.execute(
      propertyId,
      parsed.data.status,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    return NextResponse.json(interests);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/properties/[id]/interests
 *
 * Create a new property interest.
 * Idempotent: returns existing record if (contactId, propertyId) already exists.
 * Authorization happens inside CreatePropertyInterestUseCase.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params and body
    const { id: propertyId } = await context.params;
    const body = await request.json();

    // 3. Validate input
    const parsed = CreatePropertyInterestSchema.safeParse(body);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "Invalid",
        ])
      );
      throw new ValidationError("Invalid property interest input.", fields);
    }

    // 4. Call use case (authorization happens inside)
    const interest = await useCases.propertyInterests.create.execute(
      {
        ...parsed.data,
        propertyId, // From URL, not from body
      },
      {
        id: actor.id,
        role: actor.role,
      }
    );

    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
