/**
 * Admin Project [id] API
 *
 * PATCH /api/admin/projects/[id] - Update project
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth();

    const { id } = await context.params;
    const body = await request.json();

    const project = await useCases.projects.update.execute(id, body);

    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}
