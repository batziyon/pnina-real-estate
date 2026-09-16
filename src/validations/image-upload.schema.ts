/**
 * Image Upload Validation Schemas
 *
 * Zod schemas for validating image upload requests.
 */

import { z } from "zod";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/application/ports/storage/storage-key.utils";

/**
 * Schema for generating an image upload URL.
 *
 * Validates the client's upload intent before generating a signed URL.
 */
export const GenerateImageUploadSchema = z.object({
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
      (type) => ALLOWED_IMAGE_MIME_TYPES.includes(type as never),
      `Content type must be one of: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`
    ),
  size: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be positive")
    .max(MAX_IMAGE_SIZE_BYTES, `File size must not exceed ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`),
});

export type GenerateImageUploadInput = z.infer<typeof GenerateImageUploadSchema>;

/**
 * Schema for confirming an image upload.
 *
 * Validates the confirmation request after browser has uploaded to storage.
 */
export const ConfirmImageUploadSchema = z.object({
  imageId: z.string().cuid("Invalid image ID"),
  storageKey: z
    .string()
    .min(1, "Storage key is required")
    .regex(
      /^properties\/[^/]+\/images\/[^/]+\.[a-z]+$/,
      "Storage key must match pattern: properties/{propertyId}/images/{imageId}.{ext}"
    ),
  contentType: z
    .string()
    .refine(
      (type) => ALLOWED_IMAGE_MIME_TYPES.includes(type as never),
      `Content type must be one of: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`
    ),
  size: z
    .number()
    .int("File size must be an integer")
    .positive("File size must be positive")
    .max(MAX_IMAGE_SIZE_BYTES, `File size must not exceed ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`),
  alt: z.string().max(500, "Alt text too long").optional(),
});

export type ConfirmImageUploadInput = z.infer<typeof ConfirmImageUploadSchema>;
