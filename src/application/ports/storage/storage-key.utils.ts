/**
 * Storage Key Utilities
 *
 * Pure functions for generating and validating storage keys.
 * These keys determine where objects are stored in external storage (Vercel Blob, R2, S3, etc.).
 *
 * Convention: properties/{propertyId}/images/{imageId}.{extension}
 *
 * Security:
 * - Keys are always generated server-side
 * - No user-controlled path segments
 * - No original filenames in keys
 * - Extension validated against allowlist
 */

/**
 * Allowed image extensions for property images.
 */
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export type AllowedImageExtension = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];

/**
 * Maximum file size for images (10 MB).
 */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Maximum number of images per property.
 */
export const MAX_IMAGES_PER_PROPERTY = 50;

/**
 * Allowed MIME types for image uploads.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/**
 * Normalize a file extension to lowercase and remove leading dot.
 *
 * @example
 * normalizeExtension(".JPG") // "jpg"
 * normalizeExtension("png") // "png"
 * normalizeExtension(".JPEG") // "jpeg"
 */
export function normalizeExtension(extension: string): string {
  return extension.toLowerCase().replace(/^\./, "");
}

/**
 * Check if an extension is allowed for image uploads.
 *
 * @param extension - File extension (with or without leading dot)
 * @returns true if extension is allowed
 */
export function isAllowedImageExtension(extension: string): boolean {
  const normalized = normalizeExtension(extension);
  return ALLOWED_IMAGE_EXTENSIONS.includes(normalized as AllowedImageExtension);
}

/**
 * Extract and validate extension from a filename.
 *
 * @param filename - Original filename (e.g., "photo.jpg", "image.PNG")
 * @returns Normalized extension if valid
 * @throws Error if extension is missing or not allowed
 */
export function extractExtension(filename: string): AllowedImageExtension {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) {
    throw new Error("File must have a valid extension");
  }

  const extension = filename.slice(lastDot + 1);
  const normalized = normalizeExtension(extension);

  if (!isAllowedImageExtension(normalized)) {
    throw new Error(
      `Invalid image extension: ${extension}. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
    );
  }

  return normalized as AllowedImageExtension;
}

/**
 * Generate a storage key for a property image.
 *
 * Format: properties/{propertyId}/images/{imageId}.{extension}
 *
 * @param propertyId - Property CUID
 * @param imageId - Image CUID (generated before upload)
 * @param extension - File extension (validated)
 * @returns Storage key for the image
 *
 * @example
 * generateImageStorageKey("cm3x1abc", "cm3x2def", "jpg")
 * // "properties/cm3x1abc/images/cm3x2def.jpg"
 */
export function generateImageStorageKey(
  propertyId: string,
  imageId: string,
  extension: AllowedImageExtension
): string {
  return `properties/${propertyId}/images/${imageId}.${extension}`;
}

/**
 * Parse a storage key to extract property ID, image ID, and extension.
 *
 * Used for validation and debugging.
 *
 * @param storageKey - Storage key to parse
 * @returns Parsed components or null if invalid format
 *
 * @example
 * parseImageStorageKey("properties/cm3x1abc/images/cm3x2def.jpg")
 * // { propertyId: "cm3x1abc", imageId: "cm3x2def", extension: "jpg" }
 */
export function parseImageStorageKey(storageKey: string): {
  propertyId: string;
  imageId: string;
  extension: string;
} | null {
  const pattern = /^properties\/([^/]+)\/images\/([^/]+)\.([^.]+)$/;
  const match = storageKey.match(pattern);

  if (!match) {
    return null;
  }

  return {
    propertyId: match[1],
    imageId: match[2],
    extension: match[3],
  };
}

/**
 * Validate that a storage key matches the expected pattern for a specific property and image.
 *
 * Security: Prevents clients from providing arbitrary storage keys.
 *
 * @param storageKey - Storage key to validate
 * @param expectedPropertyId - Expected property ID
 * @param expectedImageId - Expected image ID
 * @returns true if valid
 */
export function validateImageStorageKey(
  storageKey: string,
  expectedPropertyId: string,
  expectedImageId: string
): boolean {
  const parsed = parseImageStorageKey(storageKey);
  if (!parsed) {
    return false;
  }

  return (
    parsed.propertyId === expectedPropertyId &&
    parsed.imageId === expectedImageId &&
    isAllowedImageExtension(parsed.extension)
  );
}

/**
 * Map MIME type to file extension.
 *
 * @param mimeType - MIME type (e.g., "image/jpeg")
 * @returns Corresponding extension or null if not supported
 */
export function mimeTypeToExtension(mimeType: string): AllowedImageExtension | null {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

/**
 * Check if a MIME type is allowed for image uploads.
 *
 * @param mimeType - MIME type to check
 * @returns true if allowed
 */
export function isAllowedImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType);
}
