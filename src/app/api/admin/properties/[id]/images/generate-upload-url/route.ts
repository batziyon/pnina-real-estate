/**
 * Generate Image Upload URL API
 *
 * POST /api/admin/properties/[id]/images/generate-upload-url
 *
 * Generates a signed URL for direct browser-to-storage upload.
 * This is the first step in the image upload flow.
 *
 * Authorization:
 * - Authenticated user
 * - User can edit the property (reuses canActorEditProperty)
 *
 * Security:
 * - propertyId from route (server-controlled)
 * - imageId generated server-side
 * - storageKey generated server-side
 * - No PropertyImage DB record created (happens in confirmation step)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { GenerateImageUploadSchema } from "@/validations/image-upload.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/properties/[id]/images/generate-upload-url
 *
 * Generate a signed upload URL for direct browser upload.
 * Authorization and validation happen inside GenerateImageUploadUseCase.
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
    const parsed = GenerateImageUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid upload request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 4. Call use case (authorization, image count check, and storage URL generation happen inside)
    const uploadIntent = await useCases.properties.generateImageUpload.execute(
      propertyId,
      parsed.data,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 5. Return upload intent
    return NextResponse.json(uploadIntent);
  } catch (error) {
    return handleApiError(error);
  }
}
