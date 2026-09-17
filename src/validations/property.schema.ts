import { z } from "zod";

const PropertyTypeEnum = z.enum([
  "APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "DUPLEX",
  "STUDIO", "OFFICE", "COMMERCIAL", "LAND", "OTHER",
]);

const DealTypeEnum = z.enum(["SALE", "RENT"]);

const PropertyStatusEnum = z.enum([
  "DRAFT", "PUBLISHED", "UNDER_CONTRACT", "SOLD", "RENTED", "ARCHIVED",
]);

export const CreatePropertySchema = z.object({
  title:          z.string().min(1, "Title is required").max(255),
  description:    z.string().max(5000).nullable().optional(),
  dealType:       DealTypeEnum,
  propertyType:   PropertyTypeEnum,
  price:          z.string().refine((v) => parseFloat(v) > 0, "Price must be greater than zero"),
  neighborhoodId: z.string().cuid("Invalid neighborhood ID"),
  address:        z.string().max(500).nullable().optional(),
  rooms:          z.string().nullable().optional(),
  area:           z.string().nullable().optional(),
  floor:          z.number().int().nullable().optional(),
  totalFloors:    z.number().int().nullable().optional(),
  status:         PropertyStatusEnum.optional(),
  parking:        z.boolean().optional(),
  elevator:       z.boolean().optional(),
  balcony:        z.boolean().optional(),
  safeRoom:       z.boolean().optional(),
  storage:        z.boolean().optional(),
  airConditioning: z.boolean().optional(),
  accessible:     z.boolean().optional(),
  furnished:      z.boolean().optional(),
  agentId:        z.string().cuid("Invalid agent ID"),
  projectId:      z.string().cuid("Invalid project ID").nullable().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

export type CreatePropertySchemaInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertySchemaInput = z.infer<typeof UpdatePropertySchema>;
