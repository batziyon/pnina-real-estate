/**
 * Admin Contact Property Interests API
 *
 * GET /api/admin/contacts/[id]/property-interests - List interests for a contact
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/contacts/[id]/property-interests
 *
 * List all property interests for a contact.
 * Read-only endpoint from contact perspective.
 * Authorization happens inside ListPropertyInterestsByContactUseCase.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { id: contactId } = await context.params;

    // 3. Call use case (authorization happens inside)
    const interests = await useCases.propertyInterests.listByContact.execute(
      contactId,
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
