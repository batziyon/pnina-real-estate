/**
 * Property Videos List API
 *
 * GET /api/admin/properties/[id]/videos
 * Returns all videos for a property
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { container } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/properties/[id]/videos
 *
 * Get all videos for a property.
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

    // 3. Get videos from repository
    const videos = await container.repositories.property.findVideos(propertyId);

    // 4. Return videos
    return NextResponse.json(videos);
  } catch (error) {
    return handleApiError(error);
  }
}
