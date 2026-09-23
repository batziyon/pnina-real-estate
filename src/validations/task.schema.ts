import { z } from "zod";

export const CreateTaskSchema = z.object({
  contactId: z.string().cuid("מזהה איש קשר לא תקין").optional().nullable(),
  propertyId: z.string().cuid("מזהה נכס לא תקין").optional().nullable(),
  title: z.string().trim().min(1, "יש להזין כותרת למשימה").max(255, "כותרת ארוכה מדי"),
  description: z.string().trim().max(2000, "תיאור ארוך מדי").optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  assignedToId: z.string().cuid("מזהה משתמש לא תקין"),
});

export const UpdateTaskSchema = z.object({
  title: z.string().trim().min(1, "יש להזין כותרת למשימה").max(255, "כותרת ארוכה מדי").optional(),
  description: z.string().trim().max(2000, "תיאור ארוך מדי").optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  assignedToId: z.string().cuid("מזהה משתמש לא תקין").optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
