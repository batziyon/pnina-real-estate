import { z } from "zod";

const ValuationStatusEnum = z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED"]);
const PropertyTypeEnum = z.enum([
  "APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "DUPLEX",
  "STUDIO", "OFFICE", "COMMERCIAL", "LAND", "OTHER",
]);

export const CreateValuationRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").max(255).nullable().optional(),
  phone: z.string().min(1, "Phone is required").max(50),
  neighborhoodId: z.string().cuid("Invalid neighborhood ID"),
  address: z.string().max(500).nullable().optional(),
  propertyType: PropertyTypeEnum.nullable().optional(),
  message: z.string().max(2000).nullable().optional(),
});

export const UpdateValuationStatusSchema = z.object({
  status: ValuationStatusEnum,
  notes: z.string().max(1000).nullable().optional(),
});

export const UpdateValuationSchema = UpdateValuationStatusSchema;

export type CreateValuationRequestInput = z.infer<typeof CreateValuationRequestSchema>;
export type UpdateValuationInput = z.infer<typeof UpdateValuationSchema>;
