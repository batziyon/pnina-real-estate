/**
 * Generate Image Upload Use Case
 *
 * Generates a signed upload URL for direct browser-to-storage upload.
 * This is the first step in the image upload flow.
 *
 * Flow:
 * 1. Validate request
 * 2. Load property
 * 3. Authorize actor
 * 4. Check image count limit
 * 5. Generate imageId and storageKey server-side
 * 6. Generate signed upload URL via ObjectStoragePort
 * 7. Return upload intent
 *
 * Security:
 * - propertyId comes from route (server-controlled)
 * - imageId generated server-side (CUID)
 * - storageKey generated server-side (controlled pattern)
 * - Client cannot choose arbitrary storage paths
 */

import { createId } from "@paralleldrive/cuid2";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
import type { UserRole } from "@/domain/user/user.types";
import {
  extractExtension,
  generateImageStorageKey,
  MAX_IMAGES_PER_PROPERTY,
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

export interface GenerateImageUploadInput {
  filename: string;
  contentType: string;
  size: number;
}

export interface ImageUploadIntent {
  uploadUrl: string;
  imageId: string;
  storageKey: string;
  expiresAt: Date;
}

export class GenerateImageUploadUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly objectStorage: ObjectStoragePort
  ) {}

  async execute(
    propertyId: string,
    input: GenerateImageUploadInput,
    actor: Actor
  ): Promise<ImageUploadIntent> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Authorization check (reuse existing property edit authorization)
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to upload images to this property.");
    }

    // 3. Check image count limit
    const existingImages = await this.propertyRepository.findImages(propertyId);
    if (existingImages.length >= MAX_IMAGES_PER_PROPERTY) {
      throw new ValidationError(
        `Property has reached the maximum limit of ${MAX_IMAGES_PER_PROPERTY} images.`,
        { imageCount: `Maximum ${MAX_IMAGES_PER_PROPERTY} images allowed` }
      );
    }

    // 4. Extract and validate extension from filename
    let extension;
    try {
      extension = extractExtension(input.filename);
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : "Invalid filename",
        { filename: "Invalid file extension" }
      );
    }

    // 5. Generate imageId server-side (CUID)
    const imageId = createId();

    // 6. Generate storageKey server-side (controlled pattern)
    const storageKey = generateImageStorageKey(propertyId, imageId, extension);

    // 7. Generate signed upload URL via ObjectStoragePort
    const uploadIntent = await this.objectStorage.generateUploadUrl(
      storageKey,
      input.contentType,
      input.size
    );

    // 8. Return upload intent (application-level DTO)
    return {
      uploadUrl: uploadIntent.uploadUrl,
      imageId,
      storageKey: uploadIntent.storageKey,
      expiresAt: uploadIntent.expiresAt,
    };
  }
}
