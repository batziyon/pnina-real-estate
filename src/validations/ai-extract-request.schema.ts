/**
 * Validation schema for AI property extraction API request.
 *
 * POST /api/admin/properties/ai-extract
 *
 * Accepts free-text property description and returns structured property data.
 */

import { z } from "zod";

export const aiExtractRequestSchema = z.object({
  /**
   * Free-text property description in Hebrew or English.
   * Minimum 20 characters to ensure meaningful content.
   */
  text: z
    .string()
    .trim()
    .min(20, "תיאור הנכס חייב להכיל לפחות 20 תווים")
    .max(10000, "תיאור הנכס ארוך מדי (מקסימום 10,000 תווים)"),
});

export type AIExtractRequest = z.infer<typeof aiExtractRequestSchema>;
