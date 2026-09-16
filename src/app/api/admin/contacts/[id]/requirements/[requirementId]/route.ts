/**
 * Buyer Requirement API — Get & Update
 *
 * GET   /api/admin/contacts/[id]/requirements/[requirementId] - Get single requirement
 * PATCH /api/admin/contacts/[id]/requirements/[requirementId] - Update requirement
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import {
  updateBuyerRequirementSchema,
} from "@/validations/buyer-requirement.schema";
import { mapBuyerRequirementToDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string; requirementId: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/admin/contacts/[id]/requirements/[requirementId]
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { requirementId } = await context.params;

    // 3. Execute use case
    const requirement = await useCases.buyerRequirements.get.execute(
      requirementId,
      actor
    );

    // 4. Map to DTO
    const dto = mapBuyerRequirementToDTO(requirement);

    return NextResponse.json(dto, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/contacts/[id]/requirements/[requirementId]
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { requirementId } = await context.params;

    // 3. Parse and validate request body
    const body = await request.json();
    const validated = updateBuyerRequirementSchema.parse(body);

    // 4. Execute use case
    const requirement = await useCases.buyerRequirements.update.execute(
      requirementId,
      validated,
      actor
    );

    // 5. Map to DTO
    const dto = mapBuyerRequirementToDTO(requirement);

    return NextResponse.json(dto, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
