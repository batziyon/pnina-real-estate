/**
 * GET /api/admin/contacts/[id]/activities - List contact activities
 * POST /api/admin/contacts/[id]/activities - Create activity
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { CreateActivitySchema } from "@/validations/activity.schema";
import { handleApiError } from "@/controllers/api-error-handler";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const user = await requireAuth();
    const { id: contactId } = await context.params;

    const activities = await useCases.activities.list.executeByContact(contactId);

    return NextResponse.json({ data: activities });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const user = await requireAuth();
    const { id: contactId } = await context.params;
    const body = await request.json();

    // Validate
    const validated = CreateActivitySchema.parse({
      ...body,
      contactId,
    });

    // Create
    const activity = await useCases.activities.create.execute({
      ...validated,
      recordedById: user.id,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
