import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { UpdateInquirySchema } from "@/validations/inquiry.schema";
import { ZodError } from "zod";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await requireAuth();
    const { id } = await context.params;
    const body = await req.json();

    // Validate request body with Zod
    const validated = UpdateInquirySchema.parse(body);

    const updated = await useCases.inquiries.updateStatus.execute(id, validated);

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
