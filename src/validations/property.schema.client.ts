import { z } from "zod";

const PropertyTypeEnum = z.enum([
  "APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "DUPLEX",
  "STUDIO", "OFFICE", "COMMERCIAL", "LAND", "OTHER",
]);

const DealTypeEnum = z.enum(["SALE", "RENT"]);

const PropertyStatusEnum = z.enum([
  "DRAFT", "PUBLISHED", "UNDER_CONTRACT", "SOLD", "RENTED", "ARCHIVED",
]);

export const CreatePropertySchemaClient = z.object({
  title:          z.string().min(1, "כותרת היא שדה חובה").max(255, "הכותרת יכולה להכיל עד 255 תווים"),
  description:    z.string().max(5000, "התיאור יכול להכיל עד 5000 תווים").nullable().optional(),
  dealType:       DealTypeEnum,
  propertyType:   PropertyTypeEnum,
  price:          z.string().refine((v) => parseFloat(v) > 0, "המחיר חייב להיות גדול מאפס"),
  neighborhoodId: z.string().cuid("מזהה שכונה לא תקין"),
  address:        z.string().max(500, "הכתובת יכולה להכיל עד 500 תווים").nullable().optional(),
  rooms:          z.string().nullable().optional(),
  area:           z.string().nullable().optional(),
  floor:          z.number().int("מספר הקומה חייב להיות מספר שלם").nullable().optional(),
  totalFloors:    z.number().int("סה\"כ קומות חייב להיות מספר שלם").nullable().optional(),
  status:         PropertyStatusEnum.optional(),
  parking:        z.boolean().optional(),
  elevator:       z.boolean().optional(),
  balcony:        z.boolean().optional(),
  safeRoom:       z.boolean().optional(),
  storage:        z.boolean().optional(),
  airConditioning: z.boolean().optional(),
  accessible:     z.boolean().optional(),
  furnished:      z.boolean().optional(),
  agentId:        z.string().cuid("מזהה סוכן לא תקין"),
  projectId:      z.string().cuid("מזהה פרויקט לא תקין").nullable().optional(),
});

export const UpdatePropertySchemaClient = CreatePropertySchemaClient.partial();

export type CreatePropertySchemaClientInput = z.infer<typeof CreatePropertySchemaClient>;
export type UpdatePropertySchemaClientInput = z.infer<typeof UpdatePropertySchemaClient>;
