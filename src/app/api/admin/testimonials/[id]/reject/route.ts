import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    await requireRole("ADMIN");
    const { id } = await context.params;

    const testimonial = await useCases.testimonials.reject.execute(id);

    return NextResponse.json(testimonial);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to reject testimonial" }, { status: 500 });
  }
}
