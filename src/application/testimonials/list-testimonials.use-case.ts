import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { TestimonialData, TestimonialFilters } from "@/domain/testimonial/testimonial.types";
import type { PaginationParams, PaginationMeta } from "@/types";

/**
 * List all testimonials (admin view).
 * Unlike list-public-testimonials, this returns ALL statuses for management.
 */
export class ListTestimonialsUseCase {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async execute(
    filters: TestimonialFilters = {},
    pagination: PaginationParams
  ): Promise<{ data: TestimonialData[]; meta: PaginationMeta }> {
    return this.testimonialRepository.findMany(filters, pagination);
  }
}
