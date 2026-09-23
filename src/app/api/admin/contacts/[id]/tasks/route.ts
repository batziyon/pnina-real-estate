/**
 * GET /api/admin/contacts/[id]/tasks - List contact tasks
 * POST /api/admin/contacts/[id]/tasks - Create task
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { CreateTaskSchema } from "@/validations/task.schema";
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

    const tasks = await useCases.tasks.list.executeByContact(contactId);

    return NextResponse.json({ data: tasks });
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
    const validated = CreateTaskSchema.parse({
      ...body,
      contactId: contactId || body.contactId,
    });

    // Create
    const task = await useCases.tasks.create.execute({
      ...validated,
      createdById: user.id,
      assignedToId: validated.assignedToId || user.id,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
