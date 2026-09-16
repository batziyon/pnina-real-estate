/**
 * Buyer Requirements API — List & Create
 *
 * GET  /api/admin/contacts/[id]/requirements - List requirements for a contact
 * POST /api/admin/contacts/[id]/requirements - Create a new requirement
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import {
  createBuyerRequirementSchema,
} from "@/validations/buyer-requirement.schema";
import { mapBuyerRequirementToDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/admin/contacts/[id]/requirements
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { id } = await context.params;

    // 3. Execute use case
    const requirements = await useCases.buyerRequirements.listByContact.execute(
      id,
      actor
    );

    // 4. Map to DTO
    const dtos = requirements.map(mapBuyerRequirementToDTO);

    return NextResponse.json(dtos, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/contacts/[id]/requirements
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { id } = await context.params;

    // 3. Parse and validate request body
    const body = await request.json();
    const validated = createBuyerRequirementSchema.parse({
      ...body,
      contactId: id, // Map id param to contactId property
    });

    // 4. Execute use case
    const requirement = await useCases.buyerRequirements.create.execute(
      validated,
      actor
    );

    // 5. Map to DTO
    const dto = mapBuyerRequirementToDTO(requirement);

    return NextResponse.json(dto, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
