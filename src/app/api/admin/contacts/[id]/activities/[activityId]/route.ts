/**
 * PATCH /api/admin/contacts/[id]/activities/[activityId] - Update activity
 * DELETE /api/admin/contacts/[id]/activities/[activityId] - Delete activity
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { UpdateActivitySchema } from "@/validations/activity.schema";
import { handleApiError } from "@/controllers/api-error-handler";

type RouteContext = {
  params: Promise<{ id: string; activityId: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await requireAuth();
    const { activityId } = await context.params;
    const body = await request.json();

    // Validate
    const validated = UpdateActivitySchema.parse(body);

    // Update
    const activity = await useCases.activities.update.execute(
      activityId,
      validated
    );

    return NextResponse.json(activity);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await requireAuth();
    const { activityId } = await context.params;

    // Delete
    await useCases.activities.delete.execute(activityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
