import { NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { toTestimonialPublicDTO } from "@/controllers/dtos";
import { handleApiError } from "@/controllers/api-error-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/testimonials
 *
 * Returns ONLY APPROVED testimonials.
 * Public endpoint — enforces domain visibility rule through ListPublicTestimonialsUseCase.
 * Never exposes PENDING or REJECTED testimonials.
 */
export async function GET() {
  try {
    const testimonials = await useCases.testimonials.listPublic.execute();
    return NextResponse.json(testimonials.map(toTestimonialPublicDTO));
  } catch (error) {
    return handleApiError(error);
  }
}
