import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const RepublishSchema = z.object({
  reason: z.enum([
    "DEAL_FELL_THROUGH",
    "OWNER_DECISION",
    "PRICE_CHANGE",
    "OTHER",
  ]),
  notes: z.string().optional(),
});

export async function POST(req: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const body = await req.json();

    // Validate input
    const parsed = RepublishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const property = await useCases.properties.republish.execute(
      id,
      {
        reason: parsed.data.reason,
        notes: parsed.data.notes,
      },
      {
        id: user.id,
        role: user.role,
      }
    );

    return NextResponse.json(property);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to republish property" }, { status: 500 });
  }
}
