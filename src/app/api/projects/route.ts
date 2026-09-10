import { NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toProjectPublicDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects
 *
 * Returns active projects.
 * Public endpoint — only ACTIVE projects are exposed.
 */
export async function GET() {
  try {
    const projects = await useCases.projects.list.executeActive();
    return NextResponse.json(projects.map(toProjectPublicDTO));
  } catch (error) {
    return handleApiError(error);
  }
}
