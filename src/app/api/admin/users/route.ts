/**
 * GET /api/admin/users
 * 
 * List users with optional filtering by role
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Only ADMIN can list users
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const result = await useCases.users.list.execute(
      { role: role as "ADMIN" | "AGENT" | undefined },
      { page, pageSize }
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
