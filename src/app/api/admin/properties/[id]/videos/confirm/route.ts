/**
 * Confirm Video Upload API
 *
 * POST /api/admin/properties/[id]/videos/confirm
 * Confirms a successful browser-to-storage upload and persists the video metadata
 *
 * Authorization:
 * - ADMIN: Can confirm uploads for any property
 * - AGENT: Can only confirm uploads for own properties
 * - EDITOR: Same as ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { ConfirmVideoUploadSchema } from "@/validations/video-upload.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/properties/[id]/videos/confirm
 *
 * Confirm a video upload and create the database record.
 */
export async function POST(
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
    const parsed = ConfirmVideoUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid confirmation request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 4. Execute use case (handles authorization, validation, and persistence)
    const video = await useCases.properties.confirmVideoUpload.execute(
      propertyId,
      parsed.data,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 5. Return created video
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
