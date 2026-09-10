import { z } from "zod";

export const InquiryTypeEnum = z.enum([
  "PROPERTY_INTEREST", "VALUATION_REQUEST", "COOPERATION", "GENERAL_CONTACT",
]);

export const InquiryStatusEnum = z.enum([
  "NEW", "CONTACTED", "IN_PROGRESS", "CLOSED",
]);

export const CreateInquirySchema = z.object({
  propertyId: z.string().cuid("Invalid property ID").optional(),
  name:       z.string().min(1, "Name is required").max(255),
  phone:      z.string().min(1, "Phone is required").max(50),
  email:      z.string().email("Invalid email address").optional(),
  message:    z.string().max(2000).optional(),
  type:       InquiryTypeEnum.optional(),
});

export const UpdateInquiryStatusSchema = z.object({
  status: InquiryStatusEnum,
  notes:  z.string().max(2000).optional(),
});

export type CreateInquirySchemaInput = z.infer<typeof CreateInquirySchema>;
export type UpdateInquiryStatusSchemaInput = z.infer<typeof UpdateInquiryStatusSchema>;
