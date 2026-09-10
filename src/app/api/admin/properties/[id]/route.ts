/**
 * Admin Property [id] API
 *
 * Demonstrates resource-level authorization:
 * - Authorization check happens INSIDE the use case
 * - Use case calls domain rule: canActorEditProperty()
 * - Route handler only authenticates and passes actor
 *
 * PATCH /api/admin/properties/[id] - Update property
 * POST  /api/admin/properties/[id]/publish - Publish property
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/properties/[id]
 *
 * Update property.
 * Authorization happens inside UpdatePropertyUseCase via canActorEditProperty().
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params and body
    const { id } = await context.params;
    const body = await request.json();

    // 3. Call use case (authorization happens inside)
    const property = await useCases.properties.update.execute(id, body, {
      id: actor.id,
      role: actor.role,
    });

    return NextResponse.json(property);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/properties/[id]/publish
 *
 * Publish property.
 * Authorization happens inside PublishPropertyUseCase via canActorPublish().
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate
    const actor = await requireAuth();

    // 2. Parse params
    const { id } = await context.params;

    // 3. Call use case (authorization happens inside)
    const property = await useCases.properties.publish.execute(id, {
      id: actor.id,
      role: actor.role,
    });

    return NextResponse.json(property);
  } catch (error) {
    return handleApiError(error);
  }
}
