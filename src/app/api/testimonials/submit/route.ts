/**
 * POST /api/testimonials/submit
 * 
 * Public endpoint to submit a new testimonial (status: PENDING)
 */

import { NextRequest, NextResponse } from "next/server";
import { useCases } from "@/lib/container";
import { handleApiError } from "@/controllers/api-error-handler";
import { z } from "zod";

const submitTestimonialSchema = z.object({
  name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים"),
  content: z.string().min(10, "ההמלצה חייבת להכיל לפחות 10 תווים"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = submitTestimonialSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, content } = validation.data;

    // Create testimonial with PENDING status
    await useCases.testimonials.create.execute({
      name,
      content,
      // displayName is optional, don't send null
    });

    return NextResponse.json(
      { message: "ההמלצה נשלחה בהצלחה ותפורסם לאחר אישור" },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
