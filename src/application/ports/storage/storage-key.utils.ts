/**
 * Storage Key Utilities
 *
 * Pure functions for generating and validating storage keys.
 * These keys determine where objects are stored in external storage (Vercel Blob, R2, S3, etc.).
 *
 * Conventions:
 * - Images: properties/{propertyId}/images/{imageId}.{extension}
 * - Videos: properties/{propertyId}/videos/{videoId}.{extension}
 *
 * Security:
 * - Keys are always generated server-side
 * - No user-controlled path segments
 * - No original filenames in keys
 * - Extension validated against allowlist
 */

// =============================================================================
// IMAGE CONSTANTS
// =============================================================================

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

// =============================================================================
// VIDEO CONSTANTS
// =============================================================================

/**
 * Allowed video extensions for property videos.
 */
export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov"] as const;

export type AllowedVideoExtension = (typeof ALLOWED_VIDEO_EXTENSIONS)[number];

/**
 * Maximum file size for videos (100 MB).
 * Reasonable for short property tour videos (2-5 minutes at good quality).
 */
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Maximum number of videos per property.
 */
export const MAX_VIDEOS_PER_PROPERTY = 10;

/**
 * Allowed MIME types for video uploads.
 */
export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type AllowedVideoMimeType = (typeof ALLOWED_VIDEO_MIME_TYPES)[number];

// =============================================================================
// SHARED UTILITIES
// =============================================================================

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

// =============================================================================
// VIDEO-SPECIFIC UTILITIES
// =============================================================================

/**
 * Check if an extension is allowed for video uploads.
 *
 * @param extension - File extension (with or without leading dot)
 * @returns true if extension is allowed
 */
export function isAllowedVideoExtension(extension: string): boolean {
  const normalized = normalizeExtension(extension);
  return ALLOWED_VIDEO_EXTENSIONS.includes(normalized as AllowedVideoExtension);
}

/**
 * Extract and validate extension from a video filename.
 *
 * @param filename - Original filename (e.g., "tour.mp4", "video.MOV")
 * @returns Normalized extension if valid
 * @throws Error if extension is missing or not allowed
 */
export function extractVideoExtension(filename: string): AllowedVideoExtension {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1 || lastDot === filename.length - 1) {
    throw new Error("File must have a valid extension");
  }

  const extension = filename.slice(lastDot + 1);
  const normalized = normalizeExtension(extension);

  if (!isAllowedVideoExtension(normalized)) {
    throw new Error(
      `Invalid video extension: ${extension}. Allowed: ${ALLOWED_VIDEO_EXTENSIONS.join(", ")}`
    );
  }

  return normalized as AllowedVideoExtension;
}

/**
 * Generate a storage key for a property video.
 *
 * Format: properties/{propertyId}/videos/{videoId}.{extension}
 *
 * @param propertyId - Property CUID
 * @param videoId - Video CUID (generated before upload)
 * @param extension - File extension (validated)
 * @returns Storage key for the video
 *
 * @example
 * generateVideoStorageKey("cm3x1abc", "cm3x2def", "mp4")
 * // "properties/cm3x1abc/videos/cm3x2def.mp4"
 */
export function generateVideoStorageKey(
  propertyId: string,
  videoId: string,
  extension: AllowedVideoExtension
): string {
  return `properties/${propertyId}/videos/${videoId}.${extension}`;
}

/**
 * Parse a video storage key to extract property ID, video ID, and extension.
 *
 * Used for validation and debugging.
 *
 * @param storageKey - Storage key to parse
 * @returns Parsed components or null if invalid format
 *
 * @example
 * parseVideoStorageKey("properties/cm3x1abc/videos/cm3x2def.mp4")
 * // { propertyId: "cm3x1abc", videoId: "cm3x2def", extension: "mp4" }
 */
export function parseVideoStorageKey(storageKey: string): {
  propertyId: string;
  videoId: string;
  extension: string;
} | null {
  const pattern = /^properties\/([^/]+)\/videos\/([^/]+)\.([^.]+)$/;
  const match = storageKey.match(pattern);

  if (!match) {
    return null;
  }

  return {
    propertyId: match[1],
    videoId: match[2],
    extension: match[3],
  };
}

/**
 * Validate that a storage key matches the expected pattern for a specific property and video.
 *
 * Security: Prevents clients from providing arbitrary storage keys.
 *
 * @param storageKey - Storage key to validate
 * @param expectedPropertyId - Expected property ID
 * @param expectedVideoId - Expected video ID
 * @returns true if valid
 */
export function validateVideoStorageKey(
  storageKey: string,
  expectedPropertyId: string,
  expectedVideoId: string
): boolean {
  const parsed = parseVideoStorageKey(storageKey);
  if (!parsed) {
    return false;
  }

  return (
    parsed.propertyId === expectedPropertyId &&
    parsed.videoId === expectedVideoId &&
    isAllowedVideoExtension(parsed.extension)
  );
}

/**
 * Map video MIME type to file extension.
 *
 * @param mimeType - MIME type (e.g., "video/mp4")
 * @returns Corresponding extension or null if not supported
 */
export function videoMimeTypeToExtension(mimeType: string): AllowedVideoExtension | null {
  switch (mimeType.toLowerCase()) {
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return null;
  }
}

/**
 * Check if a MIME type is allowed for video uploads.
 *
 * @param mimeType - MIME type to check
 * @returns true if allowed
 */
export function isAllowedVideoMimeType(mimeType: string): boolean {
  return ALLOWED_VIDEO_MIME_TYPES.includes(mimeType as AllowedVideoMimeType);
}
