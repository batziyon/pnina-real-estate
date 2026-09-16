/**
 * Set Main Image API
 *
 * PATCH /api/admin/properties/[id]/images/[imageId]/main
 * Sets a specific image as the main image for a property
 *
 * Authorization:
 * - ADMIN: Can set main for any property
 * - AGENT: Can only set main for own properties
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
 * PATCH /api/admin/properties/[id]/images/[imageId]/main
 *
 * Set an image as the main image for a property.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse route params
    const { id: propertyId, imageId } = await context.params;

    // 3. Execute use case (handles authorization and transaction)
    const updatedImage = await useCases.properties.setMainImage.execute(
      propertyId,
      imageId,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 4. Return updated image
    return NextResponse.json(updatedImage);
  } catch (error) {
    return handleApiError(error);
  }
}
