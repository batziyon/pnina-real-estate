/**
 * Generate Video Upload URL API
 *
 * POST /api/admin/properties/[id]/videos/generate-upload-url
 * Generates a pre-signed URL for direct browser-to-storage video upload
 *
 * Authorization:
 * - ADMIN: Can generate URLs for any property
 * - AGENT: Can only generate URLs for own properties
 * - EDITOR: Same as ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { GenerateVideoUploadSchema } from "@/validations/video-upload.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/properties/[id]/videos/generate-upload-url
 *
 * Generate a pre-signed upload URL for a property video.
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
    const parsed = GenerateVideoUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid upload request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // 4. Execute use case (handles authorization and storage key generation)
    const uploadIntent = await useCases.properties.generateVideoUpload.execute(
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
