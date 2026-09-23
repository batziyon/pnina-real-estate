/**
 * Update Testimonial Use Case
 *
 * Application layer — update testimonial content.
 *
 * Rules:
 * - Only ADMIN can update testimonials
 * - Can update name, displayName, and content
 * - Status is NOT updated here (use approve/reject use cases)
 */

import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { TestimonialData } from "@/domain/testimonial/testimonial.types";
import type { UserRole } from "@/domain/user/user.types";
import { UnauthorizedError, EntityNotFoundError } from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class UpdateTestimonialUseCase {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async execute(params: {
    id: string;
    name: string;
    displayName: string | null;
    content: string;
    actor: Actor;
  }): Promise<TestimonialData> {
    const { id, name, displayName, content, actor } = params;

    // Authorization: Only ADMIN can update testimonials
    if (actor.role !== "ADMIN") {
      throw new UnauthorizedError("רק מנהלים מורשים לעדכן המלצות");
    }

    // Check testimonial exists
    const existing = await this.testimonialRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError("Testimonial", id);
    }

    // Update testimonial (status remains unchanged)
    const updated = await this.testimonialRepository.update(id, {
      name,
      displayName: displayName ?? undefined,
      content,
    });

    return updated;
  }
}
