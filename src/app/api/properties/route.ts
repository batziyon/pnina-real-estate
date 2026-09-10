import { NextRequest, NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toPropertyPublicDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";
import type { PropertyFilters } from "@/domain/property/property.types";

export const dynamic = "force-dynamic";

/**
 * GET /api/properties
 *
 * Returns published properties with optional filters and pagination.
 * Public endpoint — only PUBLISHED properties are exposed.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: PropertyFilters = {
      status: "PUBLISHED", // Enforce public visibility
      neighborhoodId: searchParams.get("neighborhoodId") ?? undefined,
      dealType: (searchParams.get("dealType") as PropertyFilters["dealType"]) ?? undefined,
      propertyType: (searchParams.get("propertyType") as PropertyFilters["propertyType"]) ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
    };

    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const result = await useCases.properties.list.execute(filters, {
      page,
      pageSize: limit,
    });

    return NextResponse.json({
      data: result.data.map(toPropertyPublicDTO),
      meta: result.meta,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
