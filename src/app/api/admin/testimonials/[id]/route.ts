/**
 * Admin Testimonial Detail API Route
 *
 * GET /api/admin/testimonials/:id - Get testimonial details
 * PATCH /api/admin/testimonials/:id - Update testimonial
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { z } from "zod";

const updateTestimonialSchema = z.object({
  name: z.string().min(1, "שם חובה"),
  displayName: z.string().optional(),
  content: z.string().min(10, "תוכן ההמלצה קצר מדי"),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();

    if (actor.role !== "ADMIN") {
      return NextResponse.json(
        { error: "רק מנהלים מורשים לצפות בהמלצות" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const testimonial = await useCases.testimonials.get.execute({
      id,
      actor,
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "המלצה לא נמצאה" },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("GET testimonial error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת ההמלצה" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();

    if (actor.role !== "ADMIN") {
      return NextResponse.json(
        { error: "רק מנהלים מורשים לעדכן המלצות" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const validation = updateTestimonialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "נתונים לא תקינים",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, displayName, content } = validation.data;

    const updated = await useCases.testimonials.update.execute({
      id,
      name,
      displayName: displayName || null,
      content,
      actor,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH testimonial error:", error);
    return NextResponse.json(
      { error: "שגיאה בעדכון ההמלצה" },
      { status: 500 }
    );
  }
}
