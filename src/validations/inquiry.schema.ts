import { z } from "zod";

const InquiryStatusEnum = z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED"]);
const InquiryTypeEnum = z.enum([
  "PROPERTY_INTEREST",
  "VALUATION_REQUEST",
  "COOPERATION",
  "GENERAL_CONTACT",
]);

export const CreateInquirySchema = z.object({
  type: InquiryTypeEnum,
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").max(255).nullable().optional(),
  phone: z.string().min(1, "Phone is required").max(50),
  message: z.string().max(2000).nullable().optional(),
  propertyId: z.string().cuid().nullable().optional(),
});

export const UpdateInquiryStatusSchema = z.object({
  status: InquiryStatusEnum,
  notes: z.string().max(1000).nullable().optional(),
});

export const UpdateInquirySchema = UpdateInquiryStatusSchema;

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof UpdateInquirySchema>;
