/**
 * Reorder Videos API
 *
 * PATCH /api/admin/properties/[id]/videos/reorder
 * Reorders all videos for a property
 *
 * Authorization:
 * - ADMIN: Can reorder any property's videos
 * - AGENT: Can only reorder own property's videos
 * - EDITOR: Same as ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { ReorderVideosSchema } from "@/validations/video-reorder.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/properties/[id]/videos/reorder
 *
 * Reorder all videos for a property.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse route params
    const { id: propertyId } = await context.params;

    // 3. Parse and validate request body
    const body = await request.json();
    const parsed = ReorderVideosSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid reorder request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 4. Execute use case (handles authorization and transaction)
    const reorderedVideos = await useCases.properties.reorderVideos.execute(
      propertyId,
      parsed.data,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 5. Return reordered videos
    return NextResponse.json(reorderedVideos);
  } catch (error) {
    return handleApiError(error);
  }
}
