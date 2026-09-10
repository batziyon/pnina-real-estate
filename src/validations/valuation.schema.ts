import { z } from "zod";

const PropertyTypeEnum = z.enum([
  "APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "DUPLEX",
  "STUDIO", "OFFICE", "COMMERCIAL", "LAND", "OTHER",
]);

export const ValuationRequestStatusEnum = z.enum([
  "NEW", "CONTACTED", "IN_PROGRESS", "CLOSED",
]);

export const CreateValuationRequestSchema = z.object({
  name:           z.string().min(1, "Name is required").max(255),
  phone:          z.string().min(1, "Phone is required").max(50),
  email:          z.string().email("Invalid email address").optional(),
  neighborhoodId: z.string().cuid("Invalid neighborhood ID"),
  address:        z.string().max(500).optional(),
  propertyType:   PropertyTypeEnum.optional(),
  rooms:          z.string().optional(),
  area:           z.string().optional(),
  message:        z.string().max(2000).optional(),
});

export const UpdateValuationStatusSchema = z.object({
  status: ValuationRequestStatusEnum,
  notes:  z.string().max(2000).optional(),
});

export type CreateValuationRequestSchemaInput = z.infer<typeof CreateValuationRequestSchema>;
export type UpdateValuationStatusSchemaInput = z.infer<typeof UpdateValuationStatusSchema>;
