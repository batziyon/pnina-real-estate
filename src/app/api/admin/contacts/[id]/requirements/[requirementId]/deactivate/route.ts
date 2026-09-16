/**
 * Buyer Requirement API — Deactivate
 *
 * POST /api/admin/contacts/[id]/requirements/[requirementId]/deactivate - Deactivate requirement
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { mapBuyerRequirementToDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string; requirementId: string }>;
}

// ---------------------------------------------------------------------------
// POST /api/admin/contacts/[id]/requirements/[requirementId]/deactivate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { requirementId } = await context.params;

    // 3. Execute use case
    const requirement = await useCases.buyerRequirements.deactivate.execute(
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
