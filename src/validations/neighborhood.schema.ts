import { z } from "zod";

export const CreateNeighborhoodSchema = z.object({
  name:      z.string().min(1, "Name is required").max(255),
  active:    z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UpdateNeighborhoodSchema = CreateNeighborhoodSchema.partial();

export type CreateNeighborhoodSchemaInput = z.infer<typeof CreateNeighborhoodSchema>;
export type UpdateNeighborhoodSchemaInput = z.infer<typeof UpdateNeighborhoodSchema>;
