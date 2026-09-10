import { z } from "zod";

export const CreateTestimonialSchema = z.object({
  name:        z.string().min(1, "Name is required").max(255),
  displayName: z.string().max(255).optional(),
  content:     z.string().min(1, "Content is required").max(2000),
});

export type CreateTestimonialSchemaInput = z.infer<typeof CreateTestimonialSchema>;
