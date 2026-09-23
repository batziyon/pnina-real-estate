/**
 * Get Testimonial Use Case
 *
 * Application layer — retrieve a single testimonial by ID.
 */

import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { TestimonialData } from "@/domain/testimonial/testimonial.types";
import type { UserRole } from "@/domain/user/user.types";

export interface Actor {
  id: string;
  role: UserRole;
}

export class GetTestimonialUseCase {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async execute(params: {
    id: string;
    actor: Actor;
  }): Promise<TestimonialData | null> {
    const { id } = params;

    // Admin can view any testimonial
    // (Public users shouldn't access this endpoint - they use the public list endpoint)
    const testimonial = await this.testimonialRepository.findById(id);

    return testimonial;
  }
}
