/**
 * Video Reorder Validation Schema
 *
 * Zod schema for validating video reorder requests.
 */

import { z } from "zod";

/**
 * Schema for reordering videos.
 *
 * Validates that the request contains a non-empty array of valid video IDs.
 */
export const ReorderVideosSchema = z.object({
  videoIds: z
    .array(z.string().cuid("Invalid video ID"))
    .min(1, "At least one video ID is required")
    .max(10, "Cannot reorder more than 10 videos at once"),
});

export type ReorderVideosInput = z.infer<typeof ReorderVideosSchema>;
