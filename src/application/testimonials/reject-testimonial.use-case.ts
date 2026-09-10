import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { TestimonialData } from "@/domain/testimonial/testimonial.types";
import { EntityNotFoundError } from "@/application/errors";

export class RejectTestimonialUseCase {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async execute(id: string): Promise<TestimonialData> {
    const testimonial = await this.testimonialRepository.findById(id);
    if (!testimonial) throw new EntityNotFoundError("Testimonial", id);

    return this.testimonialRepository.update(id, { status: "REJECTED" });
  }
}
