/**
 * Buyer Requirement Validation Schemas — Zod
 *
 * Hebrew error messages.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const dealTypeSchema = z.enum(["SALE", "RENT"], {
  errorMap: () => ({ message: "סוג עסקה חייב להיות 'קנייה' או 'שכירות'" }),
});

export const propertyTypeSchema = z
  .enum(
    [
      "APARTMENT",
      "PENTHOUSE",
      "HOUSE",
      "VILLA",
      "DUPLEX",
      "STUDIO",
      "OFFICE",
      "COMMERCIAL",
      "LAND",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "סוג נכס לא חוקי" }),
    }
  )
  .optional()
  .nullable();

export const preferenceTypeSchema = z.enum(["REQUIRED", "PREFERRED"], {
  errorMap: () => ({ message: "סוג העדפה חייב להיות 'חובה' או 'מועדף'" }),
});

// ---------------------------------------------------------------------------
// Neighborhood preference
// ---------------------------------------------------------------------------

export const neighborhoodPreferenceSchema = z.object({
  neighborhoodId: z.string().cuid({ message: "מזהה שכונה לא חוקי" }),
  preferenceType: preferenceTypeSchema,
});

// ---------------------------------------------------------------------------
// Create Buyer Requirement
// ---------------------------------------------------------------------------

export const createBuyerRequirementSchema = z
  .object({
    contactId: z.string().cuid({ message: "מזהה איש קשר לא חוקי" }),
    dealType: dealTypeSchema,
    propertyType: propertyTypeSchema,

    minRooms: z
      .number()
      .positive({ message: "מספר חדרים מינימלי חייב להיות חיובי" })
      .max(50, { message: "מספר חדרים מינימלי גבוה מדי" })
      .optional()
      .nullable(),

    maxRooms: z
      .number()
      .positive({ message: "מספר חדרים מקסימלי חייב להיות חיובי" })
      .max(50, { message: "מספר חדרים מקסימלי גבוה מדי" })
      .optional()
      .nullable(),

    minArea: z
      .number()
      .positive({ message: "שטח מינימלי חייב להיות חיובי" })
      .max(100000, { message: "שטח מינימלי גבוה מדי" })
      .optional()
      .nullable(),

    maxArea: z
      .number()
      .positive({ message: "שטח מקסימלי חייב להיות חיובי" })
      .max(100000, { message: "שטח מקסימלי גבוה מדי" })
      .optional()
      .nullable(),

    minPrice: z
      .number()
      .nonnegative({ message: "מחיר מינימלי חייב להיות אפס או חיובי" })
      .max(1000000000, { message: "מחיר מינימלי גבוה מדי" })
      .optional()
      .nullable(),

    maxPrice: z
      .number()
      .nonnegative({ message: "מחיר מקסימלי חייב להיות אפס או חיובי" })
      .max(1000000000, { message: "מחיר מקסימלי גבוה מדי" })
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(5000, { message: "הערות ארוכות מדי (מקסימום 5000 תווים)" })
      .optional()
      .nullable()
      .transform((val) => (val ? val.trim() : null)),

    neighborhoods: z
      .array(neighborhoodPreferenceSchema)
      .min(0, { message: "רשימת שכונות לא חוקית" })
      .max(50, { message: "יותר מדי שכונות (מקסימום 50)" })
      .refine(
        (neighborhoods) => {
          const ids = neighborhoods.map((n) => n.neighborhoodId);
          return ids.length === new Set(ids).size;
        },
        { message: "שכונות כפולות אינן מותרות" }
      ),
  })
  .refine(
    (data) => {
      if (
        data.minRooms !== undefined &&
        data.minRooms !== null &&
        data.maxRooms !== undefined &&
        data.maxRooms !== null
      ) {
        return data.minRooms <= data.maxRooms;
      }
      return true;
    },
    {
      message: "מספר חדרים מינימלי חייב להיות קטן או שווה למספר חדרים מקסימלי",
      path: ["minRooms"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minArea !== undefined &&
        data.minArea !== null &&
        data.maxArea !== undefined &&
        data.maxArea !== null
      ) {
        return data.minArea <= data.maxArea;
      }
      return true;
    },
    {
      message: "שטח מינימלי חייב להיות קטן או שווה לשטח מקסימלי",
      path: ["minArea"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minPrice !== undefined &&
        data.minPrice !== null &&
        data.maxPrice !== undefined &&
        data.maxPrice !== null
      ) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "מחיר מינימלי חייב להיות קטן או שווה למחיר מקסימלי",
      path: ["minPrice"],
    }
  );

// ---------------------------------------------------------------------------
// Update Buyer Requirement
// ---------------------------------------------------------------------------

export const updateBuyerRequirementSchema = z
  .object({
    dealType: dealTypeSchema.optional(),
    propertyType: propertyTypeSchema,

    minRooms: z
      .number()
      .positive({ message: "מספר חדרים מינימלי חייב להיות חיובי" })
      .max(50, { message: "מספר חדרים מינימלי גבוה מדי" })
      .optional()
      .nullable(),

    maxRooms: z
      .number()
      .positive({ message: "מספר חדרים מקסימלי חייב להיות חיובי" })
      .max(50, { message: "מספר חדרים מקסימלי גבוה מדי" })
      .optional()
      .nullable(),

    minArea: z
      .number()
      .positive({ message: "שטח מינימלי חייב להיות חיובי" })
      .max(100000, { message: "שטח מינימלי גבוה מדי" })
      .optional()
      .nullable(),

    maxArea: z
      .number()
      .positive({ message: "שטח מקסימלי חייב להיות חיובי" })
      .max(100000, { message: "שטח מקסימלי גבוה מדי" })
      .optional()
      .nullable(),

    minPrice: z
      .number()
      .nonnegative({ message: "מחיר מינימלי חייב להיות אפס או חיובי" })
      .max(1000000000, { message: "מחיר מינימלי גבוה מדי" })
      .optional()
      .nullable(),

    maxPrice: z
      .number()
      .nonnegative({ message: "מחיר מקסימלי חייב להיות אפס או חיובי" })
      .max(1000000000, { message: "מחיר מקסימלי גבוה מדי" })
      .optional()
      .nullable(),

    notes: z
      .string()
      .max(5000, { message: "הערות ארוכות מדי (מקסימום 5000 תווים)" })
      .optional()
      .nullable()
      .transform((val) => (val ? val.trim() : null)),

    active: z.boolean().optional(),

    neighborhoods: z
      .array(neighborhoodPreferenceSchema)
      .min(0, { message: "רשימת שכונות לא חוקית" })
      .max(50, { message: "יותר מדי שכונות (מקסימום 50)" })
      .refine(
        (neighborhoods) => {
          const ids = neighborhoods.map((n) => n.neighborhoodId);
          return ids.length === new Set(ids).size;
        },
        { message: "שכונות כפולות אינן מותרות" }
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.minRooms !== undefined &&
        data.minRooms !== null &&
        data.maxRooms !== undefined &&
        data.maxRooms !== null
      ) {
        return data.minRooms <= data.maxRooms;
      }
      return true;
    },
    {
      message: "מספר חדרים מינימלי חייב להיות קטן או שווה למספר חדרים מקסימלי",
      path: ["minRooms"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minArea !== undefined &&
        data.minArea !== null &&
        data.maxArea !== undefined &&
        data.maxArea !== null
      ) {
        return data.minArea <= data.maxArea;
      }
      return true;
    },
    {
      message: "שטח מינימלי חייב להיות קטן או שווה לשטח מקסימלי",
      path: ["minArea"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minPrice !== undefined &&
        data.minPrice !== null &&
        data.maxPrice !== undefined &&
        data.maxPrice !== null
      ) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "מחיר מינימלי חייב להיות קטן או שווה למחיר מקסימלי",
      path: ["minPrice"],
    }
  );

export type CreateBuyerRequirementInput = z.infer<
  typeof createBuyerRequirementSchema
>;
export type UpdateBuyerRequirementInput = z.infer<
  typeof updateBuyerRequirementSchema
>;
