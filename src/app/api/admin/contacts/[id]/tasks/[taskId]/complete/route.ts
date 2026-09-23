/**
 * POST /api/admin/contacts/[id]/tasks/[taskId]/complete - Complete task
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

type RouteContext = {
  params: Promise<{ id: string; taskId: string }>;
};

export async function POST(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await requireAuth();
    const { taskId } = await context.params;

    // Complete
    const task = await useCases.tasks.complete.execute(taskId);

    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error);
  }
}
