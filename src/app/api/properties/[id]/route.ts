import { NextRequest, NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toPropertyPublicDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/properties/[id]
 *
 * Returns a single property by ID.
 * Public endpoint — only returns PUBLISHED properties.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await useCases.properties.get.execute(id);

    // Enforce public visibility — only PUBLISHED properties are accessible
    if (property.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Property not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json(toPropertyPublicDTO(property));
  } catch (error) {
    return handleApiError(error);
  }
}
