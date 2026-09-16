/**
 * Property Video Management API
 *
 * DELETE /api/admin/properties/[id]/videos/[videoId]
 * Deletes a property video including storage object
 *
 * Authorization:
 * - ADMIN: Can delete any property's videos
 * - AGENT: Can only delete videos from own properties
 * - EDITOR: Same as ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string; videoId: string }>;
}

/**
 * DELETE /api/admin/properties/[id]/videos/[videoId]
 *
 * Delete a video from a property.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse route params
    const { id: propertyId, videoId } = await context.params;

    // 3. Execute use case (handles authorization and deletion)
    await useCases.properties.deleteVideo.execute(
      propertyId,
      videoId,
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
