import { NextRequest, NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toProjectPublicDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[id]
 *
 * Returns a single project by ID.
 * Public endpoint — only returns ACTIVE projects.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await useCases.projects.get.execute(id);

    // Enforce public visibility — only ACTIVE projects are accessible
    if (project.status !== "ACTIVE") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json(toProjectPublicDTO(project));
  } catch (error) {
    return handleApiError(error);
  }
}
