/**
 * Property Images List API
 *
 * GET /api/admin/properties/[id]/images
 * Returns all images for a property
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/properties/[id]/images
 *
 * Get all images for a property.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    await requireAuth();

    // 2. Parse route params
    const { id: propertyId } = await context.params;

    // 3. Get images from repository
    const images = await useCases.properties.get.getImages(propertyId);

    // 4. Return images
    return NextResponse.json(images);
  } catch (error) {
    return handleApiError(error);
  }
}
