import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { ListTestimonialsUseCase } from "@/application/testimonials/list-testimonials.use-case";
import { testimonialRepository } from "@/lib/container";

// Create a new use case for admin to list ALL testimonials (not just public)
const listAllTestimonialsUseCase = new ListTestimonialsUseCase(testimonialRepository);

export async function GET(req: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const status = searchParams.get("status") || undefined;

    const result = await listAllTestimonialsUseCase.execute(
      {
        status: status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
      },
      { page, pageSize }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}
