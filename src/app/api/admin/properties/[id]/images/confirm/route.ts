/**
 * Confirm Image Upload API
 *
 * POST /api/admin/properties/[id]/images/confirm
 *
 * Confirms a successful browser-to-storage upload and creates the PropertyImage record.
 * This is the second step in the image upload flow.
 *
 * Authorization:
 * - Authenticated user
 * - User can edit the property (reuses canActorEditProperty)
 *
 * Security:
 * - propertyId from route (server-controlled)
 * - storageKey validated against expected pattern
 * - Object existence verified in storage
 * - Re-checks authorization and image count
 * - Idempotent: retry returns existing image
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { ConfirmImageUploadSchema } from "@/validations/image-upload.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/properties/[id]/images/confirm
 *
 * Confirm that an image was successfully uploaded to storage.
 * Creates the PropertyImage database record.
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
    const parsed = ConfirmImageUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid confirmation request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 4. Call use case (authorization, validation, storage verification, and DB creation happen inside)
    const image = await useCases.properties.confirmImageUpload.execute(
      propertyId,
      parsed.data,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 5. Return created image
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
