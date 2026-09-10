import { z } from "zod";

const ProjectStatusEnum = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]);

export const CreateProjectSchema = z.object({
  name:           z.string().min(1, "Project name is required").max(255),
  description:    z.string().max(5000).nullable().optional(),
  neighborhoodId: z.string().cuid("Invalid neighborhood ID"),
  address:        z.string().max(500).nullable().optional(),
  status:         ProjectStatusEnum.optional(),
  coverImage:     z.string().url("Cover image must be a valid URL").nullable().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type CreateProjectSchemaInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectSchemaInput = z.infer<typeof UpdateProjectSchema>;
