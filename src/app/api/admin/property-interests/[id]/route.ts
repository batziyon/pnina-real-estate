/**
 * Admin Property Interest API
 *
 * PATCH /api/admin/property-interests/[id] - Update interest status/notes
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { repositories } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { UnauthorizedError, EntityNotFoundError } from "@/application/errors";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/property-interests/[id]
 *
 * Update property interest status or notes.
 * - ADMIN: can update any interest
 * - AGENT: can update only if they own the contact OR the property
 * - EDITOR: unauthorized
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to update property interests."
      );
    }

    // 3. Parse params and body
    const { id } = await context.params;
    const body = await request.json();

    // 4. Fetch existing interest
    const interest = await repositories.propertyInterest.findById(id);
    if (!interest) {
      throw new EntityNotFoundError("PropertyInterest", id);
    }

    // 5. Resource-level authorization for AGENT
    if (actor.role === "AGENT") {
      const [contact, property] = await Promise.all([
        repositories.contact.findById(interest.contactId),
        repositories.property.findById(interest.propertyId),
      ]);

      const ownsContact = contact?.assignedAgentId === actor.id;
      const ownsProperty = property?.agentId === actor.id;

      if (!ownsContact && !ownsProperty) {
        throw new UnauthorizedError(
          "You can only update interests for contacts or properties you manage."
        );
      }
    }
    // ADMIN can update any interest

    // 6. Update interest
    const updated = await repositories.propertyInterest.update(id, {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    });

    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
