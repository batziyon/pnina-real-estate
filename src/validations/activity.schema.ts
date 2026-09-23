import { z } from "zod";

export const CreateActivitySchema = z.object({
  contactId: z.string().cuid("מזהה איש קשר לא תקין"),
  activityType: z.enum(
    ["PHONE_CALL", "MEETING", "EMAIL_SENT", "PROPERTY_SENT", "FOLLOW_UP", "OTHER"],
    { required_error: "יש לבחור סוג פעילות" }
  ),
  title: z.string().trim().min(1, "יש להזין כותרת לפעילות").max(255, "כותרת ארוכה מדי"),
  description: z.string().trim().max(2000, "תיאור ארוך מדי").optional().nullable(),
  activityDate: z.coerce.date({ required_error: "יש להזין תאריך פעילות" }),
});

export const UpdateActivitySchema = z.object({
  activityType: z.enum([
    "PHONE_CALL",
    "MEETING",
    "EMAIL_SENT",
    "PROPERTY_SENT",
    "FOLLOW_UP",
    "OTHER",
  ]).optional(),
  title: z.string().trim().min(1, "יש להזין כותרת לפעילות").max(255, "כותרת ארוכה מדי").optional(),
  description: z.string().trim().max(2000, "תיאור ארוך מדי").optional().nullable(),
  activityDate: z.coerce.date().optional(),
});

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
