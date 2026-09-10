import type { TestimonialRepository } from "@/domain/testimonial/testimonial.repository";
import type { TestimonialData } from "@/domain/testimonial/testimonial.types";
import { CreateTestimonialSchema } from "@/validations/testimonial.schema";
import { ValidationError } from "@/application/errors";

export class CreateTestimonialUseCase {
  constructor(private readonly testimonialRepository: TestimonialRepository) {}

  async execute(rawInput: unknown): Promise<TestimonialData> {
    const parsed = CreateTestimonialSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid testimonial input.", fields);
    }

    // New testimonials always start as PENDING — never auto-published.
    return this.testimonialRepository.create({
      name: parsed.data.name,
      displayName: parsed.data.displayName,
      content: parsed.data.content,
    });
  }
}
