import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const actor = await requireAuth();
    const { noteId } = await context.params;
    const body = await req.json();

    const note = await useCases.contactNotes.update.execute(
      noteId,
      { content: body.content },
      { id: actor.id, role: actor.role }
    );

    return NextResponse.json({ data: note });
  } catch (error) {
    return handleApiError(error);
  }
}
