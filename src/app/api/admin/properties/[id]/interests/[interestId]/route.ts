/**
 * Admin Property Interest Detail API
 *
 * PATCH  /api/admin/properties/[id]/interests/[interestId] - Update interest
 * DELETE /api/admin/properties/[id]/interests/[interestId] - Delete interest
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { UpdatePropertyInterestSchema } from "@/validations/property-interest.schema";
import { ValidationError } from "@/application/errors";

interface RouteContext {
  params: Promise<{ id: string; interestId: string }>;
}

/**
 * PATCH /api/admin/properties/[id]/interests/[interestId]
 *
 * Update status and/or notes of an existing property interest.
 * Authorization happens inside UpdatePropertyInterestStatusUseCase.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params and body
    const { id: propertyId, interestId } = await context.params;
    const body = await request.json();

    // 3. Validate input
    const parsed = UpdatePropertyInterestSchema.safeParse(body);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "Invalid",
        ])
      );
      throw new ValidationError("Invalid property interest input.", fields);
    }

    // 4. Call use case (authorization and resource boundary check happen inside)
    const interest = await useCases.propertyInterests.update.execute(
      interestId,
      propertyId,
      parsed.data,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    return NextResponse.json(interest);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/properties/[id]/interests/[interestId]
 *
 * Hard-delete a property interest.
 * Prefer status=NOT_INTERESTED for real contacts; use DELETE for accidental/spam records.
 * Authorization happens inside DeletePropertyInterestUseCase.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { id: propertyId, interestId } = await context.params;

    // 3. Call use case (authorization and resource boundary check happen inside)
    await useCases.propertyInterests.delete.execute(
      interestId,
      propertyId,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
