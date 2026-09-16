/**
 * Property Image Management API
 *
 * DELETE /api/admin/properties/[id]/images/[imageId]
 * Deletes a property image including storage object
 *
 * Authorization:
 * - ADMIN: Can delete any property's images
 * - AGENT: Can only delete images from own properties
 * - EDITOR: Same as ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string; imageId: string }>;
}

/**
 * DELETE /api/admin/properties/[id]/images/[imageId]
 *
 * Delete an image from a property.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse route params
    const { id: propertyId, imageId } = await context.params;

    // 3. Execute use case (handles authorization, deletion, and main promotion)
    await useCases.properties.deleteImage.execute(
      propertyId,
      imageId,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 4. Return success (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
