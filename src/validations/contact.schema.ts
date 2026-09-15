import { z } from "zod";

export const CreateContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "שם חייב להכיל לפחות 2 תווים")
    .max(255, "שם ארוך מדי"),
  phone: z
    .string()
    .trim()
    .min(9, "מספר טלפון לא תקין")
    .max(20, "מספר טלפון לא תקין")
    .nullable()
    .optional(),
  email: z
    .string()
    .trim()
    .email("כתובת אימייל לא תקינה")
    .nullable()
    .optional(),
  notes: z.string().trim().nullable().optional(),
  assignedAgentId: z.string().cuid("מזהה סוכן לא תקין").nullable().optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const ListContactsQuerySchema = z.object({
  search: z.string().trim().optional(),
  assignedAgentId: z.string().cuid("מזהה סוכן לא תקין").optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateContactSchemaInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactSchemaInput = z.infer<typeof UpdateContactSchema>;
export type ListContactsQueryInput = z.infer<typeof ListContactsQuerySchema>;
