/**
 * Image Reorder Validation Schema
 *
 * Zod schema for validating image reorder requests.
 */

import { z } from "zod";

/**
 * Schema for reordering images.
 *
 * Validates that the request contains a non-empty array of valid image IDs.
 */
export const ReorderImagesSchema = z.object({
  imageIds: z
    .array(z.string().cuid("Invalid image ID"))
    .min(1, "At least one image ID is required")
    .max(50, "Cannot reorder more than 50 images at once"),
});

export type ReorderImagesInput = z.infer<typeof ReorderImagesSchema>;
