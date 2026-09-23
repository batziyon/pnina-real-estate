/**
 * Admin Contact Property Interests API
 *
 * GET /api/admin/contacts/[id]/property-interests - List interests for a contact (enriched with property details)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { repositories } from "@/lib/container";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/contacts/[id]/property-interests
 *
 * List all property interests for a contact, enriched with property details.
 * Authorization happens inside ListPropertyInterestsByContactUseCase.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { id: contactId } = await context.params;

    // 3. Call use case (authorization happens inside)
    const interests = await useCases.propertyInterests.listByContact.execute(
      contactId,
      {
        id: actor.id,
        role: actor.role,
      }
    );

    // 4. Enrich with property details
    const enrichedInterests = await Promise.all(
      interests.map(async (interest) => {
        const property = await repositories.property.findById(
          interest.propertyId
        );

        if (!property) {
          return {
            ...interest,
            createdAt: interest.createdAt.toISOString(),
            updatedAt: interest.updatedAt.toISOString(),
          };
        }

        // Fetch neighborhood name
        const neighborhood = await repositories.neighborhood.findById(
          property.neighborhoodId
        );

        return {
          ...interest,
          createdAt: interest.createdAt.toISOString(),
          updatedAt: interest.updatedAt.toISOString(),
          property: {
            title: property.title,
            propertyType: property.propertyType,
            dealType: property.dealType,
            price: property.price,
            neighborhoodName: neighborhood?.name || "לא ידוע",
            status: property.status,
          },
        };
      })
    );

    return NextResponse.json(enrichedInterests);
  } catch (error) {
    return handleApiError(error);
  }
}
