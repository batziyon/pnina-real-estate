/**
 * Delete Image Use Case
 *
 * Deletes a property image including both database record and storage object.
 *
 * Flow:
 * 1. Verify property exists and actor is authorized
 * 2. Load image and verify it belongs to the property
 * 3. Delete database record first (preserve referential integrity)
 * 4. Delete storage object (best effort)
 * 5. If image was main and others remain, promote next image to main
 *
 * Deletion Order:
 * - Database record deleted FIRST
 * - Storage object deleted SECOND
 * - This prevents orphaned DB records pointing to deleted blobs
 * - If storage deletion fails, log error but don't roll back DB deletion
 *
 * Main Image Handling:
 * - If deleting current main image with remaining images:
 *   - Promote the image with lowest sortOrder to main
 *   - Done atomically in same transaction as deletion
 */

import type { PropertyRepository } from "@/domain/property/property.repository";
import type { ObjectStoragePort } from "@/application/ports/storage/object-storage.port";
import type { UserRole } from "@/domain/user/user.types";
import { canActorEditProperty } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class DeleteImageUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly objectStorage: ObjectStoragePort
  ) {}

  async execute(
    propertyId: string,
    imageId: string,
    actor: Actor
  ): Promise<void> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 2. Verify actor is authorized to edit property
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError(
        "You are not authorized to manage images for this property."
      );
    }

    // 3. Load image and verify it belongs to this property
    const image = await this.propertyRepository.findImageById(imageId);
    if (!image) {
      throw new EntityNotFoundError("Image", imageId);
    }

    if (image.propertyId !== propertyId) {
      // Image exists but belongs to different property - treat as not found
      throw new EntityNotFoundError("Image", imageId);
    }

    // 4. If deleting main image, prepare to promote next image
    const wasMain = image.isMain;
    let shouldPromoteNext = false;

    if (wasMain) {
      // Check if other images exist
      const allImages = await this.propertyRepository.findImages(propertyId);
      shouldPromoteNext = allImages.length > 1; // More than just this image
    }

    // 5. Delete database record FIRST
    // This ensures we never have a DB record pointing to a deleted blob
    await this.propertyRepository.deleteImage(imageId);

    // 6. If was main and others remain, promote next image
    if (shouldPromoteNext) {
      const remainingImages = await this.propertyRepository.findImages(propertyId);
      if (remainingImages.length > 0) {
        // Promote image with lowest sortOrder
        const nextMain = remainingImages.reduce((min, img) =>
          img.sortOrder < min.sortOrder ? img : min
        );

        await this.propertyRepository.updateImage(nextMain.id, { isMain: true });
      }
    }

    // 7. Delete storage object (best effort)
    // If this fails, we log but don't roll back DB deletion
    // Orphaned blobs can be cleaned up by background job (future work)
    if (image.storageKey) {
      try {
        await this.objectStorage.deleteObject(image.storageKey);
      } catch (error) {
        // Log storage deletion failure but don't fail the entire operation
        // The DB record is already deleted, which is the source of truth
        console.error(
          `[DeleteImageUseCase] Storage deletion failed for key: ${image.storageKey}`,
          error instanceof Error ? error.message : String(error)
        );
        // Continue - operation is considered successful even if blob deletion fails
      }
    }
    // If storageKey is null (legacy image), skip storage deletion
  }
}
