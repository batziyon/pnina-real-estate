import { NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toNeighborhoodPublicDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/neighborhoods
 *
 * Returns active Jerusalem neighborhoods suitable for public filters/forms.
 * Data is read from the database through the application layer.
 */
export async function GET() {
  try {
    const neighborhoods = await useCases.neighborhoods.list.executeActive();
    return NextResponse.json(neighborhoods.map(toNeighborhoodPublicDTO));
  } catch (error) {
    return handleApiError(error);
  }
}
