/**
 * Admin Projects API
 *
 * POST /api/admin/projects - Create project
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();

    const project = await useCases.projects.create.execute(body);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
