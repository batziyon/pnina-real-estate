/**
 * Video Upload Validation Schemas
 *
 * Zod schemas for validating video upload requests.
 */

import { z } from "zod";
import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/application/ports/storage/storage-key.utils";

/**
 * Schema for generating a video upload URL.
 *
 * Validates the client's upload intent before generating a signed URL.
 */
export const GenerateVideoUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename too long")
    .refine(
      (name) => name.length > 0 && name.includes("."),
      "Filename must have an extension"
    ),
  contentType: z
    .string()
    .refine(
      (type) => ALLOWED_VIDEO_MIME_TYPES.includes(type as never),
      `Content type must be one of: ${ALLOWED_VIDEO_MIME_TYPES.join(", ")}`
    ),
  size: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be positive")
    .max(MAX_VIDEO_SIZE_BYTES, `File size must not exceed ${MAX_VIDEO_SIZE_BYTES / 1024 / 1024}MB`),
});

export type GenerateVideoUploadInput = z.infer<typeof GenerateVideoUploadSchema>;

/**
 * Schema for confirming a video upload.
 *
 * Validates the confirmation request after browser has uploaded to storage.
 */
export const ConfirmVideoUploadSchema = z.object({
  videoId: z.string().cuid("Invalid video ID"),
  storageKey: z
    .string()
    .min(1, "Storage key is required")
    .regex(
      /^properties\/[^/]+\/videos\/[^/]+\.[a-z0-9]+$/,
      "Storage key must match pattern: properties/{propertyId}/videos/{videoId}.{ext}"
    ),
  contentType: z
    .string()
    .refine(
      (type) => ALLOWED_VIDEO_MIME_TYPES.includes(type as never),
      `Content type must be one of: ${ALLOWED_VIDEO_MIME_TYPES.join(", ")}`
    ),
  size: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be positive")
    .max(MAX_VIDEO_SIZE_BYTES, `File size must not exceed ${MAX_VIDEO_SIZE_BYTES / 1024 / 1024}MB`),
});

export type ConfirmVideoUploadInput = z.infer<typeof ConfirmVideoUploadSchema>;
