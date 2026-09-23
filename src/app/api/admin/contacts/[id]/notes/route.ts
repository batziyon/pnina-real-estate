import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();
    const { id: contactId } = await context.params;

    const notes = await useCases.contactNotes.list.execute(
      contactId,
      { id: actor.id, role: actor.role }
    );

    return NextResponse.json({ data: notes });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();
    const { id: contactId } = await context.params;
    const body = await req.json();

    const note = await useCases.contactNotes.create.execute(
      {
        contactId,
        propertyId: body.propertyId,
        content: body.content,
      },
      { id: actor.id, role: actor.role }
    );

    return NextResponse.json({ data: note }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
