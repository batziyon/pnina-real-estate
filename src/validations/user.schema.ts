import { z } from "zod";

const UserRoleEnum = z.enum(["ADMIN", "AGENT", "EDITOR"]);

export const CreateUserSchema = z.object({
  name:  z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(50).optional(),
  role:  UserRoleEnum.optional(),
});

export const UpdateUserSchema = z.object({
  name:   z.string().min(1).max(255).optional(),
  phone:  z.string().max(50).optional(),
  role:   UserRoleEnum.optional(),
  active: z.boolean().optional(),
});

export type CreateUserSchemaInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserSchemaInput = z.infer<typeof UpdateUserSchema>;
