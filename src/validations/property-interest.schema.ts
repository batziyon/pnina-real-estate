import { z } from "zod";

const PropertyInterestStatusEnum = z.enum([
  "INTERESTED",
  "WAITING",
  "CONTACTED",
  "NOT_INTERESTED",
]);

const PropertyInterestSourceEnum = z.enum([
  "INQUIRY",
  "AGENT_ADDED",
  "REQUIREMENT_MATCH",
  "WEBSITE",
]);

export const CreatePropertyInterestSchema = z.object({
  contactId: z.string().cuid("Invalid contact ID"),
  source: PropertyInterestSourceEnum,
  status: PropertyInterestStatusEnum.default("INTERESTED"),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const UpdatePropertyInterestSchema = z.object({
  status: PropertyInterestStatusEnum.optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
}).refine(
  (data) => data.status !== undefined || data.notes !== undefined,
  {
    message: "At least one field must be provided for update",
  }
);

export const ListPropertyInterestsQuerySchema = z.object({
  status: PropertyInterestStatusEnum.optional(),
});
