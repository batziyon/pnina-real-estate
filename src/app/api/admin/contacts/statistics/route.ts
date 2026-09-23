/**
 * GET /api/admin/contacts/statistics
 *
 * Returns aggregate statistics for the Contacts CRM dashboard.
 * Authorization: ADMIN sees all, AGENT sees only assigned contacts.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

export async function GET() {
  try {
    const actor = await requireAuth();

    const statistics = await useCases.contacts.getStatistics.execute({
      userId: actor.id,
      userRole: actor.role,
    });

    return NextResponse.json(statistics);
  } catch (error) {
    return handleApiError(error);
  }
}
