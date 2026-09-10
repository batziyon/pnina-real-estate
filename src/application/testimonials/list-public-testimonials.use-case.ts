import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { TestimonialData } from "@/domain/testimonial/testimonial.types";

export class ListPublicTestimonialsUseCase {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  /** Returns ONLY APPROVED testimonials — enforces domain public visibility rule. */
  async execute(): Promise<TestimonialData[]> {
    return this.testimonialRepository.findApproved();
  }
}
