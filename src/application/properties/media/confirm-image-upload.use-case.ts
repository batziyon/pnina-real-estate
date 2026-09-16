/**
 * Confirm Image Upload Use Case
 *
 * Confirms a successful browser-to-storage upload and creates the PropertyImage database record.
 * This is the second and final step in the image upload flow.
 *
 * Flow:
 * 1. Load property
 * 2. Re-authorize actor
 * 3. Re-check image count limit
 * 4. Validate storageKey belongs to this property and imageId
 * 5. Verify object exists in storage
 * 6. Verify object metadata
 * 7. Determine sortOrder
 * 8. Determine isMain (first image becomes main)
 * 9. Create PropertyImage record
 * 10. Return created image
 *
 * Security:
 * - propertyId from authenticated route (server-controlled)
 * - storageKey validated against expected pattern
 * - Re-checks authorization (upload URL alone is not authorization)
 * - Verifies object actually exists in storage
 * - Idempotent: retry returns existing image
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
import type { UserRole } from "@/domain/user/user.types";
import type { PropertyImageData } from "@/domain/property/property.types";
import {
  validateImageStorageKey,
  MAX_IMAGES_PER_PROPERTY,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageMimeType,
} from "@/application/ports/storage/storage-key.utils";
import { canActorEditProperty } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export interface ConfirmImageUploadInput {
  imageId: string;
  storageKey: string;
  contentType: string;
  size: number;
  alt?: string;
}

export class ConfirmImageUploadUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly objectStorage: ObjectStoragePort
  ) {}

  async execute(
    propertyId: string,
    input: ConfirmImageUploadInput,
    actor: Actor
  ): Promise<PropertyImageData> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Re-check authorization (upload URL alone is not authorization)
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError(
        "You are not authorized to confirm uploads for this property."
      );
    }

    // 3. Validate storageKey belongs to this property and imageId
    if (!validateImageStorageKey(input.storageKey, propertyId, input.imageId)) {
      throw new ValidationError(
        "Invalid storage key. Storage key must match expected pattern for this property and image.",
        { storageKey: "Invalid storage key pattern" }
      );
    }

    // 4. Check for idempotency: if image already exists with this imageId, return it
    const existingImage = await this.propertyRepository.findImageById(input.imageId);
    if (existingImage) {
      // Image already confirmed - verify it belongs to this property and has matching storageKey
      if (existingImage.propertyId !== propertyId) {
        throw new ValidationError(
          "Image ID already exists but belongs to a different property.",
          { imageId: "Image ID conflict with another property" }
        );
      }
      
      if (existingImage.storageKey !== input.storageKey) {
        throw new ValidationError(
          "Image ID already exists but has a different storage key.",
          { imageId: "Image ID conflict with different storage key" }
        );
      }
      
      // Valid retry - return existing record (idempotent)
      return existingImage;
    }

    // 5. Fetch existing images for count check, sortOrder, and isMain calculation
    const existingImages = await this.propertyRepository.findImages(propertyId);

    // 6. Re-check image count limit (prevent race conditions)
    if (existingImages.length >= MAX_IMAGES_PER_PROPERTY) {
      throw new ValidationError(
        `Property has reached the maximum limit of ${MAX_IMAGES_PER_PROPERTY} images.`,
        { imageCount: `Maximum ${MAX_IMAGES_PER_PROPERTY} images allowed` }
      );
    }

    // 7. Verify uploaded object exists in storage
    const metadata = await this.objectStorage.getObjectMetadata(input.storageKey);
    if (!metadata.exists) {
      throw new ValidationError(
        "Uploaded image not found in storage. Upload may have failed or expired.",
        { storageKey: "Object not found in storage" }
      );
    }

    // 8. Verify object size
    if (metadata.size && metadata.size > MAX_IMAGE_SIZE_BYTES) {
      throw new ValidationError(
        `Uploaded image exceeds maximum size of ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB.`,
        { size: "Image too large" }
      );
    }

    // 9. Verify content type (if available from storage)
    if (metadata.contentType && !isAllowedImageMimeType(metadata.contentType)) {
      throw new ValidationError(
        `Invalid content type: ${metadata.contentType}. Must be image/jpeg, image/png, or image/webp.`,
        { contentType: "Invalid content type" }
      );
    }

    // 10. Validate client-provided content type
    if (!isAllowedImageMimeType(input.contentType)) {
      throw new ValidationError(
        `Invalid content type: ${input.contentType}. Must be image/jpeg, image/png, or image/webp.`,
        { contentType: "Invalid content type" }
      );
    }

    // 11. Determine sortOrder (max + 1, or 0 if no images)
    const sortOrder =
      existingImages.length > 0
        ? Math.max(...existingImages.map((img) => img.sortOrder)) + 1
        : 0;

    // 12. Determine isMain (first image becomes main)
    const isMain = existingImages.length === 0;

    // 13. Generate public URL
    const url = this.objectStorage.getPublicUrl(input.storageKey);

    // 14. Create PropertyImage record with client-provided imageId
    const image = await this.propertyRepository.addImage(propertyId, {
      id: input.imageId,  // Use imageId from upload intent as PropertyImage.id
      storageKey: input.storageKey,
      url,
      alt: input.alt ?? null,
      sortOrder,
      isMain,
    });

    return image;
  }
}
