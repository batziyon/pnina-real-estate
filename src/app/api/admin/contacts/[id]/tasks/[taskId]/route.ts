/**
 * PATCH /api/admin/contacts/[id]/tasks/[taskId] - Update task
 * DELETE /api/admin/contacts/[id]/tasks/[taskId] - Delete task
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { UpdateTaskSchema } from "@/validations/task.schema";
import { handleApiError } from "@/controllers/api-error-handler";

type RouteContext = {
  params: Promise<{ id: string; taskId: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await requireAuth();
    const { taskId } = await context.params;
    const body = await request.json();

    // Validate
    const validated = UpdateTaskSchema.parse(body);

    // Update
    const task = await useCases.tasks.update.execute(taskId, validated);

    return NextResponse.json(task);
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
    const { taskId } = await context.params;

    // Delete
    await useCases.tasks.delete.execute(taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
