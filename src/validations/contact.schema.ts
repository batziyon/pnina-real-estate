import { z } from "zod";

// Helper for optional email that can be null or empty string
const optionalEmail = z
  .union([
    z.string().trim().email("כתובת אימייל לא תקינה"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .optional();

// Helper for optional phone - only validate if not empty
const optionalPhone = z
  .union([
    z.string().trim().min(9, "מספר טלפון לא תקין").max(20, "מספר טלפון לא תקין"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .optional();

// Helper for optional string
const optionalString = (maxLength?: number) =>
  z
    .union([
      maxLength ? z.string().trim().max(maxLength) : z.string().trim(),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .optional();

export const CreateContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "שם חייב להכיל לפחות 2 תווים")
    .max(255, "שם ארוך מדי"),
  phone: optionalPhone,
  email: optionalEmail,
  notes: optionalString(),
  roles: z.array(z.enum(["BUYER", "SELLER", "RENTER", "LANDLORD", "INVESTOR", "COLLABORATOR", "OTHER"])).optional().default([]),
  assignedAgentId: z
    .union([
      z.string().cuid("מזהה סוכן לא תקין"),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  
  // PHASE 2 - Enhanced fields
  preferredName: optionalString(255),
  secondaryPhone: optionalString(20),
  secondaryEmail: optionalEmail,
  preferredCommunication: z.enum(["PHONE", "EMAIL", "WHATSAPP"]).optional().default("PHONE"),
  currentCity: optionalString(100),
  currentNeighborhood: optionalString(100),
  currentAddress: optionalString(500),
  currentPropertyStatus: optionalString(100),
  interestedInSelling: z.boolean().optional().default(false),
  sellingTimeframe: optionalString(100),
  sellingReason: optionalString(500),
  valuationRequested: z.boolean().optional().default(false),
  valuationCompleted: z.boolean().optional().default(false),
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
